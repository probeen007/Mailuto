import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Template from "@/models/Template";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";
import type { EmailBlock } from "@/types/email-blocks";

const DEFAULT_VARIABLES = ['name', 'service', 'nextDate'];

// Schema for text-based template updates
const textTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

// Schema for block-based template updates
const blockTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  blocks: z.array(z.any()).optional(),
  isBlockBased: z.boolean().optional(),
});

async function getAllowedVariables(userId: string): Promise<string[]> {
  const subscribers = await Subscriber.find({ userId });
  const customVars = new Set<string>();
  
  subscribers.forEach((sub: any) => {
    if (sub.customVariables) {
      Object.keys(sub.customVariables).forEach(key => customVars.add(key));
    }
  });
  
  return [...DEFAULT_VARIABLES, ...Array.from(customVars)];
}

function validateTemplateVariables(text: string, allowedVars: string[]): boolean {
  const variableRegex = /\{\{(\w+)\}\}/g;
  let match;
  
  while ((match = variableRegex.exec(text)) !== null) {
    const variable = match[1];
    if (!allowedVars.includes(variable)) {
      return false;
    }
  }
  return true;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const template = await Template.findOne({ _id: params.id, userId: session.user.id });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const isBlockBased = body.isBlockBased === true || template.isBlockBased;

    // Validate based on template type
    let validatedData;
    if (isBlockBased) {
      validatedData = blockTemplateSchema.parse(body);
    } else {
      validatedData = textTemplateSchema.parse(body);
      
      // Validate variables for text-based templates
      const allowedVars = await getAllowedVariables(session.user.id);

      if (validatedData.subject && !validateTemplateVariables(validatedData.subject, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in subject. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      }

      if (validatedData.body && !validateTemplateVariables(validatedData.body, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in body. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Update template
    Object.assign(template, validatedData);
    if (isBlockBased && 'blocks' in validatedData && validatedData.blocks) {
      template.body = ''; // Clear body for block templates
    }
    await template.save();

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Template update error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const template = await Template.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

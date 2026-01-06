import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Template from "@/models/Template";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";
import type { EmailBlock } from "@/types/email-blocks";

const DEFAULT_VARIABLES = ['name', 'service', 'nextDate'];

// Schema for legacy text-based templates
const textTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  isBlockBased: z.literal(false).optional(),
});

// Schema for new block-based templates
const blockTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  blocks: z.array(z.any()).min(1, "At least one block is required"),
  isBlockBased: z.literal(true),
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const templates = await Template.find({ userId: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const isBlockBased = body.isBlockBased === true;

    // Validate based on template type
    let validatedData;
    if (isBlockBased) {
      validatedData = blockTemplateSchema.parse(body);
    } else {
      validatedData = textTemplateSchema.parse(body);
    }

    await connectDB();

    // For text-based templates, validate variables
    if (!isBlockBased) {
      const allowedVars = await getAllowedVariables(session.user.id);

      if (!validateTemplateVariables(validatedData.subject, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in subject. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      }

      if (!validateTemplateVariables(validatedData.body, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in body. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Create template
    const template = await Template.create({
      ...validatedData,
      userId: session.user.id,
      body: isBlockBased ? '' : validatedData.body, // Empty body for block templates
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Template creation error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

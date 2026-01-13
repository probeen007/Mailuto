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
  htmlBody: z.string().min(1).optional(),
  isHtmlMode: z.boolean().optional(),
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
    const isHtmlMode = body.isHtmlMode === true;

    // Validate based on template type
    let validatedData;
    if (isBlockBased) {
      validatedData = blockTemplateSchema.parse(body);
    } else {
      validatedData = textTemplateSchema.parse(body);
      
      // Validate variables for text-based and HTML templates
      const allowedVars = await getAllowedVariables(session.user.id);

      if (validatedData.subject && !validateTemplateVariables(validatedData.subject, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in subject. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      }

      if (isHtmlMode && validatedData.htmlBody && !validateTemplateVariables(validatedData.htmlBody, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in HTML body. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      } else if (validatedData.body && !validateTemplateVariables(validatedData.body, allowedVars)) {
        return NextResponse.json(
          { error: `Invalid variables in body. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Update template with proper validation
    Object.assign(template, validatedData);
    
    if (isBlockBased && 'blocks' in validatedData && validatedData.blocks) {
      template.body = ''; // Clear body for block templates
      template.htmlBody = undefined;
      template.isBlockBased = true;
      template.isHtmlMode = false;
    } else if (isHtmlMode) {
      // Ensure htmlBody exists for HTML templates
      if (!validatedData.htmlBody && !template.htmlBody) {
        return NextResponse.json(
          { error: "HTML templates require htmlBody content" },
          { status: 400 }
        );
      }
      template.isHtmlMode = true;
      template.isBlockBased = false;
      template.blocks = undefined;
    } else {
      // Ensure body exists for text templates
      if (!validatedData.body && !template.body) {
        return NextResponse.json(
          { error: "Text templates require body content" },
          { status: 400 }
        );
      }
      template.isBlockBased = false;
      template.isHtmlMode = false;
      template.blocks = undefined;
      template.htmlBody = undefined;
    }
    
    await template.save();

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a readable string
      const errorMessage = error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
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
    
    // Import Group model dynamically to avoid circular dependencies
    const Group = (await import("@/models/Group")).default;
    
    // Check if template is used by any groups
    const groupCount = await Group.countDocuments({ templateId: params.id });
    if (groupCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete template used by ${groupCount} group(s). Remove it from groups first.` },
        { status: 400 }
      );
    }
    
    const template = await Template.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Template deletion error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

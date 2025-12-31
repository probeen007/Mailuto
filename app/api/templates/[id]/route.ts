import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Template from "@/models/Template";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const DEFAULT_VARIABLES = ['name', 'service', 'nextDate'];

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
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
  const matches = text.matchAll(variableRegex);
  
  for (const match of matches) {
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

    const body = await request.json();
    const validatedData = templateSchema.parse(body);

    await connectDB();
    
    // Get allowed variables including custom ones
    const allowedVars = await getAllowedVariables(session.user.id);

    if (!validateTemplateVariables(validatedData.subject, allowedVars) || 
        !validateTemplateVariables(validatedData.body, allowedVars)) {
      return NextResponse.json(
        { error: `Invalid variables. Allowed: ${allowedVars.map(v => `{{${v}}}`).join(', ')}` },
        { status: 400 }
      );
    }

    const template = await Template.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      validatedData,
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
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

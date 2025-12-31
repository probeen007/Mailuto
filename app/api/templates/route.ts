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
    const validatedData = templateSchema.parse(body);

    await connectDB();
    
    // Get allowed variables including custom ones
    const allowedVars = await getAllowedVariables(session.user.id);

    // Validate variables in subject and body
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

    const template = await Template.create({
      ...validatedData,
      userId: session.user.id,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

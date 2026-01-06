import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { replaceTemplateVariables } from "@/lib/template-utils";
import { renderBlocksToHTML } from "@/lib/block-renderer";
import type { EmailBlock } from "@/types/email-blocks";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, subject, body, blocks, isBlockBased } = await req.json();

    if (!email || !subject) {
      return NextResponse.json(
        { error: "Email and subject are required" },
        { status: 400 }
      );
    }

    if (isBlockBased && (!blocks || !Array.isArray(blocks))) {
      return NextResponse.json(
        { error: "Blocks array is required for block-based templates" },
        { status: 400 }
      );
    }

    if (!isBlockBased && !body) {
      return NextResponse.json(
        { error: "Body is required for text-based templates" },
        { status: 400 }
      );
    }

    // Sample data for test email
    const sampleData: Record<string, string> = {
      name: "John Doe",
      email: email,
      service: "Premium Plan",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };

    // Replace variables in subject
    const processedSubject = replaceTemplateVariables(subject, sampleData);
    
    // Generate email body based on template type
    let processedBody: string;
    if (isBlockBased) {
      // Block-based template: render blocks to HTML
      processedBody = renderBlocksToHTML(blocks as EmailBlock[], sampleData);
    } else {
      // Legacy text-based template
      processedBody = replaceTemplateVariables(body, sampleData);
    }

    // Send test email
    await sendEmail({
      to: email,
      subject: processedSubject,
      body: processedBody,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email}` 
    });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}

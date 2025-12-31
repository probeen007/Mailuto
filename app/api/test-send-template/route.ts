import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { replaceTemplateVariables } from "@/lib/template-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, subject, body } = await req.json();

    if (!email || !subject || !body) {
      return NextResponse.json(
        { error: "Email, subject, and body are required" },
        { status: 400 }
      );
    }

    // Sample data for test email
    const sampleData: Record<string, string> = {
      name: "John Doe",
      service: "Premium Plan",
      nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    // Replace variables in subject and body with sample data
    const processedSubject = replaceTemplateVariables(subject, sampleData);
    const processedBody = replaceTemplateVariables(body, sampleData);

    // Send test email
    await sendEmail(email, processedSubject, processedBody);

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

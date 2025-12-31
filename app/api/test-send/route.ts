import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import Subscriber from "@/models/Subscriber";
import Template from "@/models/Template";
import { sendEmail } from "@/lib/email";
import { replaceTemplateVariables } from "@/lib/template-utils";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all active schedules for this user
    const schedules = await Schedule.find({ 
      userId: session.user.id,
      isActive: true 
    }).populate('subscriberId').populate('templateId');

    if (schedules.length === 0) {
      return NextResponse.json({ 
        message: "No active schedules found",
        sent: 0
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const schedule of schedules) {
      const subscriber = schedule.subscriberId as any;
      const template = schedule.templateId as any;

      if (!subscriber || !template) {
        results.push({
          schedule: schedule._id,
          status: "error",
          message: "Missing subscriber or template"
        });
        failCount++;
        continue;
      }

      try {
        // Replace template variables
        const variables: Record<string, string> = {
          name: subscriber.name,
          service: subscriber.service,
          nextDate: subscriber.nextDate 
            ? new Date(subscriber.nextDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'Not set',
          ...subscriber.customVariables,
        };

        const subject = replaceTemplateVariables(template.subject, variables);
        const body = replaceTemplateVariables(template.body, variables);

        // Send email
        const sent = await sendEmail({
          to: subscriber.email,
          subject,
          body,
        });

        if (sent) {
          results.push({
            schedule: schedule._id,
            subscriber: subscriber.email,
            template: template.name,
            status: "success"
          });
          successCount++;
        } else {
          results.push({
            schedule: schedule._id,
            subscriber: subscriber.email,
            status: "error",
            message: "Email sending failed"
          });
          failCount++;
        }
      } catch (error) {
        results.push({
          schedule: schedule._id,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error"
        });
        failCount++;
      }
    }

    return NextResponse.json({
      message: `Test complete: ${successCount} sent, ${failCount} failed`,
      totalSchedules: schedules.length,
      successCount,
      failCount,
      results
    });

  } catch (error) {
    console.error("Test send error:", error);
    return NextResponse.json({ 
      error: "Failed to send test emails",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

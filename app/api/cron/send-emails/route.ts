import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import Subscriber from "@/models/Subscriber";
import Template from "@/models/Template";
import { sendEmail, replaceTemplateVariables } from "@/lib/email";
import { addMonths, addDays, format } from "date-fns";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify this is a cron request (optional security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow both cron and manual trigger
    // In production, you might want to restrict this
  }

  try {
    await connectDB();

    const now = new Date();
    const dueSchedules = await Schedule.find({
      isActive: true,
      nextSendDate: { $lte: now },
    })
      .populate('subscriberId')
      .populate('templateId');

    const results = [];

    for (const schedule of dueSchedules) {
      try {
        const subscriber = schedule.subscriberId as any;
        const template = schedule.templateId as any;

        if (!subscriber || !template) {
          continue;
        }

        // Calculate next send date
        let nextSendDate;
        if (schedule.scheduleType === 'monthly') {
          nextSendDate = addMonths(new Date(schedule.nextSendDate), 1);
        } else {
          nextSendDate = addDays(new Date(schedule.nextSendDate), schedule.intervalDays!);
        }

        // Prepare variables
        const variables: Record<string, string> = {
          name: subscriber.name,
          service: subscriber.service,
          nextDate: subscriber.nextDate 
            ? format(new Date(subscriber.nextDate), 'MMMM d, yyyy')
            : format(nextSendDate, 'MMMM d, yyyy'),
          ...subscriber.customVariables,
        };

        // Replace variables in template
        const subject = replaceTemplateVariables(template.subject, variables);
        const body = replaceTemplateVariables(template.body, variables);

        // Send email
        const success = await sendEmail({
          to: subscriber.email,
          subject,
          body,
        });

        if (success) {
          await Schedule.updateOne(
            { _id: schedule._id },
            {
              lastSentDate: now,
              nextSendDate,
            }
          );
          results.push({ success: true, email: subscriber.email });
        } else {
          results.push({ success: false, email: subscriber.email });
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule._id}:`, error);
        results.push({ success: false, error: String(error) });
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}

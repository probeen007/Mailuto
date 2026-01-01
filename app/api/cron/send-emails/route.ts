import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendEmail, replaceTemplateVariables } from "@/lib/email";
import { addMonths, addDays, format } from "date-fns";

// Import models AFTER connecting to DB to ensure they're registered
let Schedule: any;
let Subscriber: any;
let Template: any;

export const dynamic = 'force-dynamic';
// maxDuration: 10s (Hobby), 60s (Pro), 300s (Enterprise)
// Remove or set to 10 for Hobby plan
// export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify cron authentication
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, enforce authentication
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    
    // Load models after DB connection
    if (!Schedule) {
      Schedule = (await import("@/models/Schedule")).default;
      Subscriber = (await import("@/models/Subscriber")).default;
      Template = (await import("@/models/Template")).default;
    }

    const now = new Date();
    // Only process schedules that are due (not too far in the past to prevent stuck schedules)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dueSchedules = await Schedule.find({
      isActive: true,
      nextSendDate: { $gte: oneDayAgo, $lte: now },
    })
      .populate('subscriberId')
      .populate('templateId')
      .limit(100); // Limit to 100 schedules per run to avoid timeout

    const results = [];

    for (const schedule of dueSchedules) {
      try {
        const subscriber = schedule.subscriberId as any;
        const template = schedule.templateId as any;

        if (!subscriber || !template) {
          console.warn(`Skipping schedule ${schedule._id}: missing subscriber or template`);
          results.push({ 
            success: false, 
            scheduleId: schedule._id.toString(),
            error: 'Missing subscriber or template' 
          });
          continue;
        }
        
        if (!subscriber.email) {
          console.warn(`Skipping schedule ${schedule._id}: subscriber has no email`);
          results.push({ 
            success: false, 
            scheduleId: schedule._id.toString(),
            error: 'Subscriber has no email' 
          });
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
          results.push({ 
            success: true, 
            scheduleId: schedule._id.toString(),
            email: subscriber.email,
            nextSendDate: nextSendDate.toISOString()
          });
        } else {
          results.push({ 
            success: false, 
            scheduleId: schedule._id.toString(),
            email: subscriber.email,
            error: 'Email sending failed'
          });
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule._id}:`, error);
        results.push({ 
          success: false, 
          scheduleId: schedule._id?.toString() || 'unknown',
          error: error instanceof Error ? error.message : String(error)
        });
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

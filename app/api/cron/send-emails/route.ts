import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendEmail, replaceTemplateVariables } from "@/lib/email";
import { renderBlocksToHTML } from "@/lib/block-renderer";
import type { EmailBlock } from "@/types/email-blocks";
import { addDays, format } from "date-fns";

// Import models AFTER connecting to DB to ensure they're registered
let Subscriber: any;
let Group: any;
let Template: any;

export const dynamic = 'force-dynamic';

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
    if (!Subscriber) {
      Subscriber = (await import("@/models/Subscriber")).default;
      Group = (await import("@/models/Group")).default;
      Template = (await import("@/models/Template")).default;
    }

    const now = new Date();
    // Find subscribers whose nextSendDate is due and are active
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const dueSubscribers = await Subscriber.find({
      isActive: true,
      nextSendDate: { $gte: oneDayAgo, $lte: now },
    })
      .populate('groupId')
      .limit(100); // Limit to 100 per run to avoid timeout

    const results = [];

    for (const subscriber of dueSubscribers) {
      try {
        // Validate subscriber has required data
        if (!subscriber.email || !subscriber.email.includes('@')) {
          console.warn(`Skipping subscriber ${subscriber._id}: invalid email`);
          results.push({ 
            success: false, 
            subscriberId: subscriber._id.toString(),
            error: 'Invalid or missing email address' 
          });
          continue;
        }
        
        if (!subscriber.nextSendDate) {
          console.warn(`Skipping subscriber ${subscriber._id}: no nextSendDate`);
          results.push({ 
            success: false, 
            subscriberId: subscriber._id.toString(),
            error: 'No nextSendDate set' 
          });
          continue;
        }

        // Get group and template
        const group = subscriber.groupId;
        if (!group || !group.isActive) {
          console.warn(`Skipping subscriber ${subscriber._id}: no active group`);
          results.push({ 
            success: false, 
            subscriberId: subscriber._id.toString(),
            error: 'No active group assigned' 
          });
          continue;
        }

        const template = await Template.findById(group.templateId);
        if (!template) {
          console.warn(`Skipping subscriber ${subscriber._id}: template not found`);
          results.push({ 
            success: false, 
            subscriberId: subscriber._id.toString(),
            error: 'Template not found' 
          });
          continue;
        }

        // Calculate next send date based on group interval
        const currentSendDate = new Date(subscriber.nextSendDate);
        const nextSendDate = addDays(currentSendDate, group.intervalDays);

        // Prepare variables with safe handling
        const variables: Record<string, string> = {
          name: subscriber.name || '',
          email: subscriber.email || '',
          service: subscriber.service || '',
          date: format(now, 'MMMM d, yyyy'),
          nextDate: subscriber.nextDate 
            ? format(new Date(subscriber.nextDate), 'MMMM d, yyyy')
            : format(nextSendDate, 'MMMM d, yyyy'),
        };
        
        // Add custom variables safely
        if (subscriber.customVariables && typeof subscriber.customVariables === 'object') {
          Object.assign(variables, subscriber.customVariables);
        }

        // Generate email content based on template type
        const subject = replaceTemplateVariables(template.subject, variables);
        let emailBody: string;

        // Priority 1: HTML mode templates
        if (template.isHtmlMode) {
          if (!template.htmlBody) {
            console.error(`HTML template "${template.name}" (${template._id}) has no HTML body`);
            results.push({ 
              success: false, 
              subscriberId: subscriber._id.toString(),
              error: `HTML template has no HTML body content` 
            });
            continue;
          }
          emailBody = replaceTemplateVariables(template.htmlBody, variables);
        } 
        // Priority 2: Block-based templates
        else if (template.isBlockBased) {
          if (!template.blocks || !Array.isArray(template.blocks) || template.blocks.length === 0) {
            console.error(`Block template "${template.name}" (${template._id}) has no blocks`);
            results.push({ 
              success: false, 
              subscriberId: subscriber._id.toString(),
              error: `Block template has no blocks defined` 
            });
            continue;
          }
          emailBody = renderBlocksToHTML(template.blocks as EmailBlock[], variables);
        } 
        // Priority 3: Legacy text-based templates
        else {
          if (!template.body || template.body.trim() === '') {
            console.error(`Text template "${template.name}" (${template._id}) has no body`);
            results.push({ 
              success: false, 
              subscriberId: subscriber._id.toString(),
              error: `Text template has no body content` 
            });
            continue;
          }
          emailBody = replaceTemplateVariables(template.body, variables);
        }

        // Send email
        const success = await sendEmail({
          to: subscriber.email,
          subject,
          body: emailBody,
        });

        if (success) {
          // Update subscriber's nextSendDate
          await Subscriber.updateOne(
            { _id: subscriber._id },
            {
              nextSendDate,
            }
          );
          results.push({ 
            success: true, 
            subscriberId: subscriber._id.toString(),
            email: subscriber.email,
            nextSendDate: nextSendDate.toISOString()
          });
        } else {
          results.push({ 
            success: false, 
            subscriberId: subscriber._id.toString(),
            email: subscriber.email,
            error: 'Email sending failed'
          });
        }
      } catch (error) {
        console.error(`Error processing subscriber ${subscriber._id}:`, error);
        results.push({ 
          success: false, 
          subscriberId: subscriber._id?.toString() || 'unknown',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      processed: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
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

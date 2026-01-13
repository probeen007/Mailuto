import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import Group from "@/models/Group";
import Template from "@/models/Template";
import { sendEmail } from "@/lib/email";
import { replaceTemplateVariables } from "@/lib/template-utils";
import { renderBlocksToHTML } from "@/lib/block-renderer";
import type { EmailBlock } from "@/types/email-blocks";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all active subscribers with groups for this user
    const subscribers = await Subscriber.find({ 
      userId: session.user.id,
      isActive: true,
      groupId: { $exists: true, $ne: null }
    }).populate('groupId').limit(50); // Limit to 50 for testing

    if (subscribers.length === 0) {
      return NextResponse.json({ 
        message: "No active subscribers with groups found",
        sent: 0
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      // Validate subscriber email
      if (!subscriber.email || !subscriber.email.includes('@')) {
        results.push({
          subscriber: subscriber.email || 'unknown',
          status: "error",
          message: "Invalid email address"
        });
        failCount++;
        continue;
      }
      
      const group = subscriber.groupId as any;

      if (!group || !group.isActive) {
        results.push({
          subscriber: subscriber.email,
          status: "error",
          message: "No active group assigned"
        });
        failCount++;
        continue;
      }

      const template = await Template.findById(group.templateId);

      if (!template) {
        results.push({
          subscriber: subscriber.email,
          status: "error",
          message: "Template not found"
        });
        failCount++;
        continue;
      }

      try {
        // Log template info for debugging
        console.log(`Processing template: ${template.name} (ID: ${template._id})`);
        console.log(`Template flags: isHtmlMode=${template.isHtmlMode}, isBlockBased=${template.isBlockBased}`);
        console.log(`Template content: hasHtmlBody=${!!template.htmlBody}, hasBlocks=${!!template.blocks}, blocksLength=${template.blocks?.length || 0}, hasBody=${!!template.body}`);
        
        // Replace template variables with safe handling
        const variables: Record<string, string> = {
          name: subscriber.name || '',
          email: subscriber.email || '',
          service: subscriber.service || '',
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          nextDate: subscriber.nextDate 
            ? new Date(subscriber.nextDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'Not set',
        };
        
        // Add custom variables safely
        if (subscriber.customVariables && typeof subscriber.customVariables === 'object') {
          Object.assign(variables, subscriber.customVariables);
        }

        const subject = replaceTemplateVariables(template.subject, variables);
        
        // Generate email body based on template type
        let body: string;
        
        // Priority 1: HTML mode templates
        if (template.isHtmlMode) {
          if (!template.htmlBody) {
            throw new Error(`HTML template "${template.name}" has no HTML body content`);
          }
          body = replaceTemplateVariables(template.htmlBody, variables);
        } 
        // Priority 2: Block-based templates
        else if (template.isBlockBased) {
          if (!template.blocks || !Array.isArray(template.blocks) || template.blocks.length === 0) {
            throw new Error(`Block template "${template.name}" has no blocks defined`);
          }
          body = renderBlocksToHTML(template.blocks as EmailBlock[], variables);
        } 
        // Priority 3: Legacy text-based templates
        else {
          if (!template.body || template.body.trim() === '') {
            throw new Error(`Text template "${template.name}" has no body content`);
          }
          body = replaceTemplateVariables(template.body, variables);
        }

        // Send email
        const sent = await sendEmail({
          to: subscriber.email,
          subject,
          body,
        });

        if (sent) {
          results.push({
            subscriber: subscriber.email,
            group: group.name,
            template: template.name,
            status: "success"
          });
          successCount++;
        } else {
          results.push({
            subscriber: subscriber.email,
            status: "error",
            message: "Email sending failed"
          });
          failCount++;
        }
      } catch (error) {
        results.push({
          subscriber: subscriber.email,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error"
        });
        failCount++;
      }
    }

    return NextResponse.json({
      message: `Test complete: ${successCount} sent, ${failCount} failed`,
      totalSubscribers: subscribers.length,
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

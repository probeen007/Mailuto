const mongoose = require('mongoose');
const { addMonths, addDays, format } = require('date-fns');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Import email service
const { sendEmail, replaceTemplateVariables } = require('../lib/email');

async function sendScheduledEmails() {
  try {
    console.log('Starting scheduled email job...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get models
    const Schedule = mongoose.model('Schedule');
    const Subscriber = mongoose.model('Subscriber');
    const Template = mongoose.model('Template');

    // Find all schedules that are due
    const now = new Date();
    const dueSchedules = await Schedule.find({
      isActive: true,
      nextSendDate: { $lte: now },
    })
      .populate('subscriberId')
      .populate('templateId');

    console.log(`Found ${dueSchedules.length} due schedules`);

    for (const schedule of dueSchedules) {
      try {
        const subscriber = schedule.subscriberId;
        const template = schedule.templateId;

        if (!subscriber || !template) {
          console.error(`Missing subscriber or template for schedule ${schedule._id}`);
          continue;
        }

        // Calculate next send date for the email
        let nextSendDate;
        if (schedule.scheduleType === 'monthly') {
          nextSendDate = addMonths(schedule.nextSendDate, 1);
        } else {
          nextSendDate = addDays(schedule.nextSendDate, schedule.intervalDays);
        }

        // Prepare variables
        const variables = {
          name: subscriber.name,
          email: subscriber.email,
          service: subscriber.service,
          nextDate: format(nextSendDate, 'MMMM d, yyyy'),
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
          // Update schedule
          await Schedule.updateOne(
            { _id: schedule._id },
            {
              lastSentDate: now,
              nextSendDate,
            }
          );
          console.log(`✓ Sent email to ${subscriber.email}`);
        } else {
          console.error(`✗ Failed to send email to ${subscriber.email}`);
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule._id}:`, error);
      }
    }

    console.log('Scheduled email job completed');
  } catch (error) {
    console.error('Fatal error in scheduled email job:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the job
sendScheduledEmails();

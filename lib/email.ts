import { Resend } from 'resend';
import { replaceTemplateVariables } from './template-utils';

// Lazy initialization to prevent client-side errors
let resendInstance: Resend | null = null;

function getResendInstance(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailData): Promise<boolean> {
  try {
    const resend = getResendInstance();
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: body,
    });

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Re-export for backward compatibility
export { replaceTemplateVariables };

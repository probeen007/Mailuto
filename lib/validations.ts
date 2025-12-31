import { z } from "zod";

export const subscriberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Service is required").max(100, "Service name is too long"),
});

export const templateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100, "Name is too long"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject is too long"),
  body: z.string().min(1, "Body is required").max(5000, "Body is too long"),
});

export const scheduleSchema = z.object({
  subscriberId: z.string().min(1, "Subscriber is required"),
  templateId: z.string().min(1, "Template is required"),
  scheduleType: z.enum(["monthly", "interval"]),
  dayOfMonth: z.number().min(1).max(31).optional(),
  intervalDays: z.number().min(1).max(365).optional(),
});

export type SubscriberInput = z.infer<typeof subscriberSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;

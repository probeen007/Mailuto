import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";
import { z } from "zod";
import { addMonths, addDays, startOfDay, setDate } from "date-fns";

const scheduleSchema = z.object({
  subscriberId: z.string().min(1, "Subscriber is required"),
  templateId: z.string().min(1, "Template is required"),
  scheduleType: z.enum(["monthly", "interval"]),
  dayOfMonth: z.number().min(1).max(31).optional(),
  intervalDays: z.number().min(1).optional(),
});

function calculateNextSendDate(
  scheduleType: 'monthly' | 'interval',
  dayOfMonth?: number,
  intervalDays?: number
): Date {
  const now = startOfDay(new Date());
  
  if (scheduleType === 'monthly' && dayOfMonth) {
    let nextDate = setDate(now, dayOfMonth);
    if (nextDate <= now) {
      nextDate = addMonths(nextDate, 1);
    }
    return nextDate;
  } else if (scheduleType === 'interval' && intervalDays) {
    return addDays(now, intervalDays);
  }
  
  throw new Error('Invalid schedule configuration');
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const schedules = await Schedule.find({ userId: session.user.id })
      .populate('subscriberId')
      .populate('templateId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    // Validate schedule type requirements
    if (validatedData.scheduleType === 'monthly' && !validatedData.dayOfMonth) {
      return NextResponse.json(
        { error: "Day of month is required for monthly schedules" },
        { status: 400 }
      );
    }

    if (validatedData.scheduleType === 'interval' && !validatedData.intervalDays) {
      return NextResponse.json(
        { error: "Interval days is required for interval schedules" },
        { status: 400 }
      );
    }

    const nextSendDate = calculateNextSendDate(
      validatedData.scheduleType,
      validatedData.dayOfMonth,
      validatedData.intervalDays
    );

    await connectDB();
    const schedule = await Schedule.create({
      ...validatedData,
      userId: session.user.id,
      nextSendDate,
      isActive: true,
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

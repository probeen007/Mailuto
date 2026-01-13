import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const subscriberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Service is required"),
  groupId: z.string().optional(), // NEW: Group assignment
  nextDate: z.string().optional(),
  nextSendDate: z.string().optional(), // NEW
  isActive: z.boolean().optional().default(true), // NEW
  customVariables: z.record(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    const filter: any = { userId: session.user.id };
    if (groupId) {
      filter.groupId = groupId;
    }
    
    const subscribers = await Subscriber.find(filter)
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("GET /api/subscribers error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = subscriberSchema.parse(body);

    await connectDB();
    
    // Build subscriber data with validated dates
    const subscriberData: any = {
      ...validatedData,
      userId: session.user.id,
    };
    
    // Handle dates with validation
    if (validatedData.nextDate) {
      try {
        const nextDate = new Date(validatedData.nextDate);
        if (isNaN(nextDate.getTime())) {
          return NextResponse.json({ error: "Invalid nextDate format" }, { status: 400 });
        }
        subscriberData.nextDate = nextDate;
      } catch (e) {
        return NextResponse.json({ error: "Invalid nextDate format" }, { status: 400 });
      }
    }
    
    if (validatedData.nextSendDate) {
      try {
        const nextSendDate = new Date(validatedData.nextSendDate);
        if (isNaN(nextSendDate.getTime())) {
          return NextResponse.json({ error: "Invalid nextSendDate format" }, { status: 400 });
        }
        subscriberData.nextSendDate = nextSendDate;
      } catch (e) {
        return NextResponse.json({ error: "Invalid nextSendDate format" }, { status: 400 });
      }
    } else if (validatedData.nextDate) {
      // Default nextSendDate to nextDate if not provided
      subscriberData.nextSendDate = subscriberData.nextDate;
    }
    
    const subscriber = await Subscriber.create(subscriberData);

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscribers error:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}

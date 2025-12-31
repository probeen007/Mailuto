import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const subscriberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Service is required"),
  nextDate: z.string().optional(),
  customVariables: z.record(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log("GET session:", JSON.stringify(session));
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const subscribers = await Subscriber.find({ userId: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("GET /api/subscribers error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    console.log("POST session:", JSON.stringify(session));
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - Please sign in again" }, { status: 401 });
    }

    const body = await request.json();
    console.log("POST body received:", JSON.stringify(body));
    
    const validatedData = subscriberSchema.parse(body);
    console.log("POST validated data:", JSON.stringify(validatedData));

    await connectDB();
    const subscriber = await Subscriber.create({
      ...validatedData,
      userId: session.user.id,
      nextDate: validatedData.nextDate ? new Date(validatedData.nextDate) : undefined,
    });
    
    console.log("POST created subscriber:", JSON.stringify(subscriber));

    return NextResponse.json(subscriber, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscribers error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}

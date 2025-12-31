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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("PUT body received:", JSON.stringify(body));
    
    const validatedData = subscriberSchema.parse(body);
    console.log("PUT validated data:", JSON.stringify(validatedData));

    await connectDB();
    const subscriber = await Subscriber.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
        ...validatedData,
        nextDate: validatedData.nextDate ? new Date(validatedData.nextDate) : undefined,
      },
      { new: true }
    );
    
    console.log("PUT updated subscriber:", JSON.stringify(subscriber));

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error("PUT /api/subscribers error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const subscriber = await Subscriber.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}

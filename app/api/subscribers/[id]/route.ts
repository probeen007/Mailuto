import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const subscriberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.string().min(1, "Service is required"),
  groupId: z.string().optional(), // NEW
  nextDate: z.string().optional(),
  nextSendDate: z.string().optional(), // NEW
  isActive: z.boolean().optional(), // NEW
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
    const validatedData = subscriberSchema.parse(body);

    await connectDB();
    
    // Build update object, only including dates that are valid
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      service: validatedData.service,
      groupId: validatedData.groupId || null,
      isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
      customVariables: validatedData.customVariables || {},
    };
    
    // Handle dates - only update if provided and valid
    if (validatedData.nextDate) {
      try {
        updateData.nextDate = new Date(validatedData.nextDate);
        if (isNaN(updateData.nextDate.getTime())) {
          return NextResponse.json({ error: "Invalid nextDate format" }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid nextDate format" }, { status: 400 });
      }
    }
    
    if (validatedData.nextSendDate) {
      try {
        updateData.nextSendDate = new Date(validatedData.nextSendDate);
        if (isNaN(updateData.nextSendDate.getTime())) {
          return NextResponse.json({ error: "Invalid nextSendDate format" }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid nextSendDate format" }, { status: 400 });
      }
    }
    
    const subscriber = await Subscriber.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updateData,
      { new: true }
    );

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error("PUT /api/subscribers error:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
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

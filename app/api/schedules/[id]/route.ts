import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Schedule from "@/models/Schedule";

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
    const schedule = await Schedule.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isActive } = await request.json();

    await connectDB();
    const schedule = await Schedule.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { isActive },
      { new: true }
    );

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

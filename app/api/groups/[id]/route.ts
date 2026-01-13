import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Template from "@/models/Template";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  intervalDays: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

// GET: Fetch single group with subscribers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const group = await Group.findOne({ 
      _id: params.id, 
      userId: session.user.id 
    }).populate('templateId', 'name subject isBlockBased');

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get subscribers in this group
    const subscribers = await Subscriber.find({ 
      groupId: params.id,
      userId: session.user.id 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      ...group.toObject(),
      subscribers,
    });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}

// PUT: Update group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const group = await Group.findOne({ _id: params.id, userId: session.user.id });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateGroupSchema.parse(body);

    // If changing template, verify it exists
    if (validatedData.templateId) {
      const template = await Template.findOne({
        _id: validatedData.templateId,
        userId: session.user.id,
      });
      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
    }

    // Update group
    Object.assign(group, validatedData);
    await group.save();

    const updatedGroup = await Group.findById(group._id).populate('templateId', 'name subject isBlockBased');
    return NextResponse.json(updatedGroup);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    console.error("Group update error:", error);
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}

// DELETE: Delete group
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

    const group = await Group.findOne({ _id: params.id, userId: session.user.id });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if group has subscribers
    const subscriberCount = await Subscriber.countDocuments({ groupId: params.id });
    if (subscriberCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete group with ${subscriberCount} subscribers. Move or delete them first.` },
        { status: 400 }
      );
    }

    await Group.deleteOne({ _id: params.id });
    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Group deletion error:", error);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}

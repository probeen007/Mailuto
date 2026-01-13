import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Template from "@/models/Template";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  templateId: z.string().min(1, "Template is required"),
  intervalDays: z.number().min(1).default(30),
  isActive: z.boolean().default(true),
});

// GET: Fetch all groups for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const groups = await Group.find({ userId: session.user.id })
      .populate('templateId', 'name subject isBlockBased')
      .sort({ createdAt: -1 });

    // Count subscribers for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const subscriberCount = await Subscriber.countDocuments({ 
          groupId: group._id,
          userId: session.user.id 
        });
        return {
          ...group.toObject(),
          subscriberCount,
        };
      })
    );

    return NextResponse.json(groupsWithCounts);
  } catch (error) {
    console.error("Groups fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST: Create new group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = groupSchema.parse(body);

    await connectDB();

    // Verify template exists and belongs to user
    const template = await Template.findOne({
      _id: validatedData.templateId,
      userId: session.user.id,
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Create group
    const group = await Group.create({
      ...validatedData,
      userId: session.user.id,
    });

    const populatedGroup = await Group.findById(group._id).populate('templateId', 'name subject isBlockBased');

    return NextResponse.json(populatedGroup, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    console.error("Group creation error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}

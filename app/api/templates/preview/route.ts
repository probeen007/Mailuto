import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderBlocksToHTML } from "@/lib/block-renderer";
import type { EmailBlock } from "@/types/email-blocks";

// Sample data for preview
const SAMPLE_VARIABLES = {
  name: "John Doe",
  email: "john@example.com",
  service: "Premium Plan",
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blocks } = await request.json();

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: "Blocks array is required" },
        { status: 400 }
      );
    }

    // Validate blocks
    const validatedBlocks: EmailBlock[] = blocks.map((block, index) => ({
      ...block,
      order: block.order ?? index,
      id: block.id || `block-${index}`,
    }));

    // Generate HTML
    const html = renderBlocksToHTML(validatedBlocks, SAMPLE_VARIABLES);

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Preview generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    console.log("Test session route - Full session:", JSON.stringify(session, null, 2));
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      fullSession: session
    });
  } catch (error) {
    console.error("Error in test-session:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  return NextResponse.json({
    hasAuthHeader: !!authHeader,
    authHeader: authHeader || 'NOT_SET',
    hasCronSecret: !!cronSecret,
    cronSecretLength: cronSecret?.length || 0,
    cronSecretFirstChars: cronSecret?.substring(0, 5) || 'NOT_SET',
    match: authHeader === `Bearer ${cronSecret}`,
    expected: cronSecret ? `Bearer ${cronSecret}` : 'CRON_SECRET not set in environment'
  });
}

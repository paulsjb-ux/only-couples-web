/**
 * Edge warm endpoint — cron every 5 min kills most cold starts.
 * Merge cron into vercel.json then redeploy.
 */
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({ ok: true, t: Date.now() });
}

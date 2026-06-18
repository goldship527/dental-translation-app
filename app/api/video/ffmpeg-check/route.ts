import { NextResponse } from "next/server";
import { checkFfmpegStatus, isFfmpegReady } from "@/lib/video";

export const runtime = "nodejs";

export async function GET() {
  const status = await checkFfmpegStatus();
  return NextResponse.json({
    ready: isFfmpegReady(status),
    ...status
  });
}

import { NextResponse } from "next/server";
import { readRenderedVideo } from "@/lib/video";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId")?.trim() ?? "";
    const fileName = url.searchParams.get("fileName")?.trim() ?? "";

    if (!jobId || !fileName) {
      return NextResponse.json({ error: "英語版動画が見つかりません。" }, { status: 400 });
    }

    const video = await readRenderedVideo(jobId, fileName);
    const videoBytes = new Uint8Array(video.buffer.byteLength);
    videoBytes.set(video.buffer);
    return new NextResponse(videoBytes, {
      headers: {
        "Content-Type": video.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("[video.rendered-video]", error);
    return NextResponse.json({ error: "英語版動画を読み込めませんでした。" }, { status: 500 });
  }
}

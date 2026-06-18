import { NextResponse } from "next/server";
import { readNarrationAudio } from "@/lib/video";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId")?.trim() ?? "";
    const fileName = url.searchParams.get("fileName")?.trim() ?? "";

    if (!jobId || !fileName) {
      return NextResponse.json({ error: "ナレーション音声が見つかりません。" }, { status: 400 });
    }

    const audio = await readNarrationAudio(jobId, fileName);
    const audioBytes = new Uint8Array(audio.buffer.byteLength);
    audioBytes.set(audio.buffer);
    return new NextResponse(audioBytes, {
      headers: {
        "Content-Type": audio.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("[video.narration-audio]", error);
    return NextResponse.json({ error: "ナレーション音声を読み込めませんでした。" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { extractAudioFromMp4, maxVideoUploadSizeBytes } from "@/lib/video";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json({ error: "MP4ファイルを選択してください。" }, { status: 400 });
    }

    const lowerName = video.name.toLowerCase();
    const looksLikeMp4 = video.type === "video/mp4" || lowerName.endsWith(".mp4");
    if (!looksLikeMp4) {
      return NextResponse.json({ error: "Keynoteで書き出したMP4ファイルを選択してください。" }, { status: 400 });
    }

    if (video.size > maxVideoUploadSizeBytes) {
      return NextResponse.json(
        { error: "1GBを超える動画は、まず短い検証動画でお試しください。" },
        { status: 413 }
      );
    }

    const result = await extractAudioFromMp4(video.name, Buffer.from(await video.arrayBuffer()));
    return NextResponse.json({
      jobId: result.jobId,
      sourceFileName: result.sourceFileName,
      audioFileName: result.audioFileName,
      sourcePath: result.sourcePath,
      audioPath: result.audioPath
    });
  } catch (error) {
    console.error("[video.extract-audio]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "動画から音声を抽出できませんでした。"
      },
      { status: 500 }
    );
  }
}

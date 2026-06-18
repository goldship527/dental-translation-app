import { NextResponse } from "next/server";
import { readSubtitleFile } from "@/lib/video";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId")?.trim() ?? "";
    const fileName = url.searchParams.get("fileName")?.trim() ?? "";

    if (!jobId || !fileName) {
      return NextResponse.json({ error: "字幕ファイルが見つかりません。" }, { status: 400 });
    }

    const subtitles = await readSubtitleFile(jobId, fileName);

    return new NextResponse(subtitles.content, {
      headers: {
        "Content-Type": subtitles.contentType,
        "Content-Disposition": `attachment; filename="${subtitles.fileName}"`
      }
    });
  } catch (error) {
    console.error("[video.subtitles]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "字幕ファイルを読み込めませんでした。"
      },
      { status: 500 }
    );
  }
}

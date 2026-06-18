import { NextResponse } from "next/server";
import { readDistributionPackageZip } from "@/lib/video";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId")?.trim() ?? "";

    if (!jobId) {
      return NextResponse.json({ error: "配布用パッケージの作業IDが見つかりません。" }, { status: 400 });
    }

    const zip = await readDistributionPackageZip(jobId);

    return new NextResponse(new Uint8Array(zip.buffer), {
      headers: {
        "Content-Type": zip.contentType,
        "Content-Disposition": `attachment; filename="${zip.fileName}"`,
        "Content-Length": String(zip.buffer.byteLength)
      }
    });
  } catch (error) {
    console.error("[video.package-zip]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "配布用パッケージZIPを作成できませんでした。"
      },
      { status: 500 }
    );
  }
}

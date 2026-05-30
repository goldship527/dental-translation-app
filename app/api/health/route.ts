import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    gemini: Boolean(getGeminiClient()),
    openai: Boolean(getOpenAIClient())
  });
}

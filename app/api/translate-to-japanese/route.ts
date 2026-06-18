import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { getGeminiClient, getGeminiTranslationModel } from "@/lib/gemini";
import { getDentalGlossary } from "@/lib/glossary";
import { getOpenAIClient, getOpenAITranslationModel } from "@/lib/openai";
import { buildEnglishToJapanesePrompt } from "@/lib/prompts";
import type { ApiProvider } from "@/lib/types";

export const runtime = "nodejs";

const englishToJapaneseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    japanese: {
      type: "string",
      description: "Natural Japanese translation of the English dental transcript."
    }
  },
  required: ["japanese"]
} as const;

type TranslateToJapaneseBody = {
  text?: string;
  provider?: ApiProvider;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateToJapaneseBody;

    if (!body.text?.trim()) {
      return NextResponse.json({ error: "日本語化する英語テキストがありません。" }, { status: 400 });
    }

    const text = body.text.trim();
    const prompt = buildEnglishToJapanesePrompt({
      text,
      glossary: await getRelevantEnglishGlossaryEntries(text)
    });

    if (body.provider === "openai") {
      return await translateToJapaneseWithOpenAI(prompt);
    }

    return await translateToJapaneseWithGemini(prompt);
  } catch (error) {
    console.error("[translate-to-japanese]", error);
    return NextResponse.json(
      { error: formatApiError(error, "英語から日本語への翻訳APIでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}

async function getRelevantEnglishGlossaryEntries(text: string) {
  const normalizedText = text.toLowerCase();
  const glossary = await getDentalGlossary();
  return glossary
    .filter((entry) => entry.en && normalizedText.includes(entry.en.toLowerCase()))
    .slice(0, 80);
}

async function translateToJapaneseWithGemini(prompt: string) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY または GOOGLE_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  const response = await withOneRetryOnUnavailable(() =>
    ai.models.generateContent({
      model: getGeminiTranslationModel(),
      contents: [
        {
          text:
            "You are a precise dental lecture interpreter. Translate English into Japanese only; do not provide diagnosis, treatment planning, or added medical advice."
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: englishToJapaneseSchema
      }
    })
  );

  const parsed = JSON.parse(response.text ?? "{}") as { japanese?: string };
  if (!parsed.japanese) {
    throw new Error("Gemini APIの日本語化レスポンスを解析できませんでした。");
  }

  return NextResponse.json(parsed);
}

async function translateToJapaneseWithOpenAI(prompt: string) {
  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません。" }, { status: 500 });
  }

  const response = await openai.responses.create({
    model: getOpenAITranslationModel(),
    input: [
      {
        role: "system",
        content:
          "You are a precise dental lecture interpreter. Translate English into Japanese only; do not provide diagnosis, treatment planning, or added medical advice."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "english_to_japanese_translation",
        strict: true,
        schema: englishToJapaneseSchema
      }
    }
  });

  const parsed = JSON.parse(response.output_text) as { japanese: string };
  return NextResponse.json(parsed);
}

async function withOneRetryOnUnavailable<T>(request: () => Promise<T>) {
  try {
    return await request();
  } catch (error) {
    if (!isUnavailableError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 900));
    return await request();
  }
}

function isUnavailableError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { status?: number; code?: string | number; message?: string };
  const message = candidate.message?.toLowerCase() ?? "";
  return candidate.status === 503 || candidate.code === 503 || message.includes("high demand") || message.includes("unavailable");
}

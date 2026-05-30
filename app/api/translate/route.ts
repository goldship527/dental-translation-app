import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { getGeminiClient, getGeminiTranslationModel } from "@/lib/gemini";
import { getRelevantGlossaryEntries } from "@/lib/glossary";
import { getOpenAIClient, getOpenAITranslationModel } from "@/lib/openai";
import { buildTranslationPrompt } from "@/lib/prompts";
import type { ApiProvider, DentalGlossaryEntry, Mode, StylePreset } from "@/lib/types";

export const runtime = "nodejs";

const translationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    english: {
      type: "string",
      description: "Professional English translation."
    },
    chinese: {
      type: "string",
      description: "Simplified Chinese translation."
    }
  },
  required: ["english", "chinese"]
} as const;

type TranslateBody = {
  text?: string;
  mode?: Mode;
  style?: StylePreset;
  provider?: ApiProvider;
  glossary?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateBody;

    if (!body.text?.trim()) {
      return NextResponse.json({ error: "翻訳する日本語テキストがありません。" }, { status: 400 });
    }

    const text = body.text.trim();
    const prompt = buildTranslationPrompt({
      text,
      mode: body.mode ?? "lecture",
      style: body.style ?? "professional",
      glossary: [
        ...(await getRelevantGlossaryEntries(text)),
        ...getRelevantCustomGlossaryEntries(text, body.glossary)
      ].slice(0, 80)
    });

    if (body.provider === "openai") {
      return await translateWithOpenAI(prompt);
    }

    return await translateWithGemini(prompt);
  } catch (error) {
    console.error("[translate]", error);
    return NextResponse.json(
      { error: formatApiError(error, "翻訳APIでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}

function getRelevantCustomGlossaryEntries(text: string, value: unknown): DentalGlossaryEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isGlossaryEntryCandidate)
    .map((entry) => ({
      id: entry.id,
      ja: entry.ja.trim(),
      en: entry.en.trim(),
      zh: entry.zh.trim(),
      category: entry.category.trim(),
      risk: entry.risk,
      ...(entry.note ? { note: entry.note.trim() } : {})
    }))
    .filter((entry) => entry.ja && entry.en && entry.zh && entry.category && text.includes(entry.ja))
    .slice(0, 50);
}

function isGlossaryEntryCandidate(value: unknown): value is DentalGlossaryEntry {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<DentalGlossaryEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.ja === "string" &&
    typeof candidate.en === "string" &&
    typeof candidate.zh === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.risk === "boolean" &&
    (candidate.note === undefined || typeof candidate.note === "string")
  );
}

async function translateWithGemini(prompt: string) {
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
            "You are a precise dental lecture translator. Translate only; do not provide diagnosis, treatment planning, or added medical advice."
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: translationSchema
      }
    })
  );

  const parsed = JSON.parse(response.text ?? "{}") as { english?: string; chinese?: string };
  if (!parsed.english || !parsed.chinese) {
    throw new Error("Gemini APIの翻訳レスポンスを解析できませんでした。");
  }

  return NextResponse.json(parsed);
}

async function translateWithOpenAI(prompt: string) {
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
          "You are a precise dental lecture translator. Translate only; do not provide diagnosis, treatment planning, or added medical advice."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "dental_translation",
        strict: true,
        schema: translationSchema
      }
    }
  });

  const parsed = JSON.parse(response.output_text) as { english: string; chinese: string };
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

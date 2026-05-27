import type { DentalGlossaryEntry, Mode, StylePreset } from "@/lib/types";

const modeInstructions: Record<Mode, string> = {
  lecture:
    "Use a professional dental lecture tone. Make the translation natural for dental professionals, avoid casual phrasing, and preserve educational structure.",
  qa:
    "Use concise, natural Q&A phrasing. Keep the answer easy to speak aloud while preserving technical dental terminology.",
  script:
    "Use polished manuscript-ready phrasing suitable for prepared slides or lecture notes. Preserve paragraph flow."
};

const styleInstructions: Record<StylePreset, string> = {
  professional: "Style: professional dental lecture tone for clinicians.",
  business: "Style: polite business tone suitable for meetings and product explanations.",
  concise: "Style: short, direct, and easy to speak.",
  patient: "Style: clear patient-facing explanation without losing factual accuracy.",
  handsOn: "Style: practical hands-on instruction for a seminar or live demonstration."
};

export function buildTranslationPrompt({
  text,
  mode,
  style,
  glossary
}: {
  text: string;
  mode: Mode;
  style: StylePreset;
  glossary: DentalGlossaryEntry[];
}) {
  const glossaryLines = glossary
    .map((entry) => `- ${entry.ja}: en="${entry.en}", zh="${entry.zh}", category=${entry.category}, risk=${entry.risk}`)
    .join("\n");

  return [
    "Translate the Japanese dental lecture text into natural professional English and Simplified Chinese for dental professionals.",
    "Preserve technical terms, numerical values, anatomical directions, implant system names, product names, procedure names, contraindications, and indications accurately.",
    "Do not add medical claims, diagnoses, treatment recommendations, or safety claims that are not present in the original.",
    modeInstructions[mode],
    styleInstructions[style],
    "Return only JSON that matches the requested schema.",
    "",
    "Dental glossary preferences:",
    glossaryLines || "(No glossary terms provided.)",
    "",
    "Japanese source text:",
    text
  ].join("\n");
}

export type Mode = "lecture" | "qa" | "script";

export type StylePreset = "professional" | "business" | "concise" | "patient" | "handsOn";

export type ApiProvider = "gemini" | "openai";

export type SpeechLanguage = "en" | "zh";

export type SpeechVoiceStyle = "standard" | "calm" | "lecture";

export type DentalGlossaryEntry = {
  id: string;
  ja: string;
  en: string;
  zh: string;
  category: string;
  risk: boolean;
  reading?: string;
  note?: string;
};

export type RiskItem = {
  kind: string;
  term: string;
  en?: string;
  zh?: string;
  note?: string;
};

import type { DentalGlossaryEntry } from "@/lib/types";

export type CustomGlossaryForm = {
  ja: string;
  en: string;
  zh: string;
  reading: string;
  category: string;
  risk: boolean;
  note: string;
};

export const customGlossaryStorageKey = "dental-lecture-translator:custom-glossary";

export const emptyCustomGlossaryForm: CustomGlossaryForm = {
  ja: "",
  en: "",
  zh: "",
  reading: "",
  category: "implant",
  risk: false,
  note: ""
};

export const glossaryCategoryLabels: Record<string, string> = {
  all: "すべて",
  implant: "インプラント",
  surgery: "外科",
  bone: "骨造成・骨補填",
  sinus: "上顎洞",
  soft: "軟組織",
  prosthetics: "補綴",
  occlusion: "咬合・荷重",
  anatomy: "解剖・部位",
  complication: "合併症",
  maintenance: "メンテナンス",
  digital: "デジタル",
  unit: "単位",
  safety: "安全・要確認",
  manufacturer: "メーカー",
  implant_system: "インプラントシステム",
  implant_surface: "表面性状・材料",
  connection: "接続様式"
};

export const glossaryCategoryOrder = [
  "implant",
  "surgery",
  "bone",
  "sinus",
  "soft",
  "prosthetics",
  "occlusion",
  "anatomy",
  "complication",
  "maintenance",
  "digital",
  "unit",
  "safety",
  "manufacturer",
  "implant_system",
  "implant_surface",
  "connection"
];

export function loadCustomGlossary() {
  if (typeof localStorage === "undefined") return [];

  try {
    const saved = localStorage.getItem(customGlossaryStorageKey);
    if (!saved) return [];
    return normalizeGlossaryImport(JSON.parse(saved));
  } catch {
    return [];
  }
}

export function saveCustomGlossary(entries: DentalGlossaryEntry[]) {
  localStorage.setItem(customGlossaryStorageKey, JSON.stringify(entries));
}

export function createCustomGlossaryEntry(form: CustomGlossaryForm): DentalGlossaryEntry | null {
  const ja = form.ja.trim();
  const en = form.en.trim();
  const zh = form.zh.trim();
  const reading = form.reading.trim();
  const category = form.category.trim();

  if (!ja || !en || !zh || !category) return null;

  return {
    id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ja,
    en,
    zh,
    ...(reading ? { reading } : {}),
    category,
    risk: form.risk,
    ...(form.note.trim() ? { note: form.note.trim() } : {})
  };
}

export function normalizeGlossaryImport(input: unknown): DentalGlossaryEntry[] {
  const rawEntries = Array.isArray(input)
    ? input
    : typeof input === "object" && input !== null && Array.isArray((input as { entries?: unknown }).entries)
      ? (input as { entries: unknown[] }).entries
      : [];

  const seenTerms = new Set<string>();
  return rawEntries.reduce<DentalGlossaryEntry[]>((entries, item, index) => {
    if (!isGlossaryEntryCandidate(item)) return entries;

    const ja = item.ja.trim();
    const en = item.en.trim();
    const zh = item.zh.trim();
    const category = item.category.trim();
    if (!ja || !en || !zh || !category || seenTerms.has(ja)) return entries;
    seenTerms.add(ja);

    entries.push({
      id: typeof item.id === "string" && item.id.startsWith("custom_") ? item.id : `custom_import_${Date.now().toString(36)}_${index}`,
      ja,
      en,
      zh,
      category,
      risk: item.risk === true,
      ...(typeof item.reading === "string" && item.reading.trim() ? { reading: item.reading.trim() } : {}),
      ...(typeof item.note === "string" && item.note.trim() ? { note: item.note.trim() } : {})
    });
    return entries;
  }, []);
}

export function getRelevantGlossaryEntriesForText(text: string, entries: DentalGlossaryEntry[]) {
  return entries.filter((entry) => entry.ja && text.includes(entry.ja)).slice(0, 50);
}

export function getGlossaryCategoryLabel(category: string) {
  return glossaryCategoryLabels[category] ?? category;
}

export function sortGlossaryCategories(categories: string[]) {
  return [...categories].sort((a, b) => {
    const indexA = glossaryCategoryOrder.indexOf(a);
    const indexB = glossaryCategoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function isCustomGlossaryEntry(entry: DentalGlossaryEntry) {
  return entry.id.startsWith("custom_");
}

function isGlossaryEntryCandidate(
  value: unknown
): value is { id?: unknown; ja: string; en: string; zh: string; reading?: unknown; category: string; risk?: unknown; note?: unknown } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<DentalGlossaryEntry>;
  return (
    typeof candidate.ja === "string" &&
    typeof candidate.en === "string" &&
    typeof candidate.zh === "string" &&
    typeof candidate.category === "string"
  );
}

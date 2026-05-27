import type { DentalGlossaryEntry, RiskItem } from "@/lib/types";

const fixedRiskTerms: Array<Omit<RiskItem, "kind"> & { kind: string }> = [
  { kind: "anatomy", term: "右側", en: "right side", zh: "右侧" },
  { kind: "anatomy", term: "左側", en: "left side", zh: "左侧" },
  { kind: "anatomy", term: "前歯部", en: "anterior region", zh: "前牙区" },
  { kind: "anatomy", term: "臼歯部", en: "posterior region", zh: "后牙区" },
  { kind: "surgery", term: "即時埋入", en: "immediate implant placement", zh: "即刻种植" },
  { kind: "prosthetics", term: "即時機能", en: "immediate function", zh: "即刻功能" },
  { kind: "safety", term: "禁忌", en: "contraindication", zh: "禁忌证" },
  { kind: "safety", term: "適応", en: "indication", zh: "适应证" },
  { kind: "unit", term: "mm", en: "mm", zh: "mm" },
  { kind: "unit", term: "Ncm", en: "Ncm", zh: "Ncm" }
];

const numericPattern = /(?:約|およそ)?\d+(?:\.\d+)?\s?(?:mm|ミリ|Ncm|度|°|週間|週|か月|ヶ月|月|年|日|分|時間)?/gi;

export function findRiskItems(text: string, glossary: DentalGlossaryEntry[]): RiskItem[] {
  if (!text.trim()) return [];

  const items: RiskItem[] = [];
  const seen = new Set<string>();

  const add = (item: RiskItem) => {
    const key = `${item.kind}:${item.term}:${item.en ?? ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push(item);
    }
  };

  glossary
    .filter((entry) => entry.risk && text.includes(entry.ja))
    .forEach((entry) =>
      add({
        kind: entry.category,
        term: entry.ja,
        en: entry.en,
        zh: entry.zh,
        note: entry.note
      })
    );

  fixedRiskTerms
    .filter((term) => text.includes(term.term))
    .forEach((term) => add(term));

  const numericMatches = text.match(numericPattern) ?? [];
  numericMatches
    .map((value) => value.trim())
    .filter((value) => /\d/.test(value))
    .forEach((value) => add({ kind: "numeric", term: value, en: value, zh: value }));

  return items;
}

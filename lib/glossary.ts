import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DentalGlossaryEntry } from "@/lib/types";

let cachedGlossary: DentalGlossaryEntry[] | null = null;

export async function getDentalGlossary() {
  if (cachedGlossary) return cachedGlossary;

  const filePath = path.join(process.cwd(), "public", "data", "dental-glossary.json");
  const raw = await readFile(filePath, "utf8");
  cachedGlossary = JSON.parse(raw) as DentalGlossaryEntry[];
  return cachedGlossary;
}

export async function getRelevantGlossaryEntries(text: string, limit = 50) {
  const glossary = await getDentalGlossary();
  return glossary.filter((entry) => entry.ja && text.includes(entry.ja)).slice(0, limit);
}

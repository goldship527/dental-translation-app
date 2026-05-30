import { describe, expect, it } from "vitest";
import { findRiskItems } from "@/lib/risk";
import type { DentalGlossaryEntry } from "@/lib/types";

const glossary: DentalGlossaryEntry[] = [
  {
    id: "anatomy_001",
    ja: "上顎",
    en: "maxilla",
    zh: "上颌",
    category: "anatomy",
    risk: true
  },
  {
    id: "surgery_001",
    ja: "骨造成",
    en: "bone augmentation",
    zh: "骨增量",
    category: "surgery",
    risk: false
  }
];

describe("findRiskItems", () => {
  it("extracts numeric values, units, directions, jaw terms, and risk glossary terms", () => {
    const items = findRiskItems("右側上顎に35 Ncmで埋入し、3.5mmの骨造成を検討します。", glossary);
    const terms = items.map((item) => item.term);

    expect(terms).toContain("上顎");
    expect(terms).toContain("右側");
    expect(terms).toContain("mm");
    expect(terms).toContain("Ncm");
    expect(terms).toContain("35 Ncm");
    expect(terms).toContain("3.5mm");
    expect(terms).not.toContain("骨造成");
  });

  it("extracts contraindication and indication terms", () => {
    const terms = findRiskItems("禁忌と適応を確認します。", glossary).map((item) => item.term);

    expect(terms).toContain("禁忌");
    expect(terms).toContain("適応");
  });

  it("deduplicates repeated terms", () => {
    const items = findRiskItems("上顎、上顎、右側、右側、35 Ncm、35 Ncm", glossary);

    expect(items.filter((item) => item.term === "上顎")).toHaveLength(1);
    expect(items.filter((item) => item.term === "右側")).toHaveLength(1);
    expect(items.filter((item) => item.term === "35 Ncm")).toHaveLength(1);
  });
});

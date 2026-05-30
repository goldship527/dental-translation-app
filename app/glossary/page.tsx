"use client";

import { ArrowLeft, Download, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createCustomGlossaryEntry,
  emptyCustomGlossaryForm,
  getGlossaryCategoryLabel,
  isCustomGlossaryEntry,
  loadCustomGlossary,
  normalizeGlossaryImport,
  saveCustomGlossary,
  sortGlossaryCategories,
  type CustomGlossaryForm
} from "@/lib/custom-glossary";
import type { ApiProvider, DentalGlossaryEntry } from "@/lib/types";

const providerLabels: Record<ApiProvider, string> = {
  gemini: "Gemini",
  openai: "OpenAI"
};

type TranslationResult = {
  english?: string;
  chinese?: string;
  error?: string;
};

export default function GlossaryPage() {
  const [provider, setProvider] = useState<ApiProvider>("gemini");
  const [standardGlossary, setStandardGlossary] = useState<DentalGlossaryEntry[]>([]);
  const [customGlossary, setCustomGlossary] = useState<DentalGlossaryEntry[]>([]);
  const [form, setForm] = useState<CustomGlossaryForm>(emptyCustomGlossaryForm);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [notice, setNotice] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCustomGlossary(loadCustomGlossary());
    fetch("/data/dental-glossary.json")
      .then((response) => {
        if (!response.ok) throw new Error("用語辞書を読み込めませんでした。");
        return response.json();
      })
      .then((data: DentalGlossaryEntry[]) => setStandardGlossary(data))
      .catch((reason: unknown) => {
        setNotice(reason instanceof Error ? reason.message : "用語辞書の読み込みに失敗しました。");
      });
  }, []);

  const effectiveGlossary = useMemo(
    () => [...standardGlossary, ...customGlossary],
    [customGlossary, standardGlossary]
  );

  const categories = useMemo(() => {
    return sortGlossaryCategories(Array.from(new Set(effectiveGlossary.map((entry) => entry.category).filter(Boolean))));
  }, [effectiveGlossary]);

  const formCategories = useMemo(() => {
    return categories.concat("safety").filter((value, index, array) => array.indexOf(value) === index);
  }, [categories]);

  const filteredGlossary = useMemo(() => {
    const query = search.trim().toLowerCase();
    return effectiveGlossary.filter((entry) => {
      const matchesCategory = category === "all" || entry.category === category;
      const matchesQuery =
        !query ||
        entry.ja.toLowerCase().includes(query) ||
        entry.reading?.toLowerCase().includes(query) ||
        entry.en.toLowerCase().includes(query) ||
        entry.zh.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        entry.note?.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [category, effectiveGlossary, search]);

  const persistCustomGlossary = (entries: DentalGlossaryEntry[]) => {
    setCustomGlossary(entries);
    saveCustomGlossary(entries);
  };

  const addEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    const nextEntry = createCustomGlossaryEntry(form);
    if (!nextEntry) {
      setNotice("日本語、英語、簡体字中国語、カテゴリーを入力してください。");
      return;
    }

    if (effectiveGlossary.some((entry) => entry.ja === nextEntry.ja)) {
      setNotice("同じ日本語用語がすでに登録されています。");
      return;
    }

    persistCustomGlossary([...customGlossary, nextEntry]);
    setForm(emptyCustomGlossaryForm);
    setNotice("追加用語を保存しました。");
  };

  const deleteEntry = (entryId: string) => {
    const entry = customGlossary.find((item) => item.id === entryId);
    if (!entry) return;
    if (!window.confirm(`追加用語「${entry.ja}」を削除しますか？`)) return;
    persistCustomGlossary(customGlossary.filter((item) => item.id !== entryId));
    setNotice("追加用語を削除しました。");
  };

  const exportEntries = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: customGlossary
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "custom-dental-glossary.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importEntries = async (file: File | undefined) => {
    if (!file) return;
    setNotice("");
    try {
      const imported = normalizeGlossaryImport(JSON.parse(await file.text()));
      if (!imported.length) {
        setNotice("取り込める用語が見つかりませんでした。");
        return;
      }

      const existingTerms = new Set(effectiveGlossary.map((entry) => entry.ja));
      const merged = [...customGlossary];
      let addedCount = 0;
      imported.forEach((entry) => {
        if (!existingTerms.has(entry.ja)) {
          merged.push(entry);
          existingTerms.add(entry.ja);
          addedCount += 1;
        }
      });
      persistCustomGlossary(merged);
      setNotice(`${addedCount}件の用語をインポートしました。重複はスキップしました。`);
    } catch {
      setNotice("JSONの読み込みに失敗しました。ファイル形式を確認してください。");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const suggestTranslations = async () => {
    const source = form.ja.trim();
    if (!source) {
      setNotice("候補生成する日本語用語を入力してください。");
      return;
    }

    setIsSuggesting(true);
    setNotice("");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: source,
          provider,
          mode: "lecture",
          style: "professional"
        })
      });
      const data = (await response.json()) as TranslationResult;
      if (!response.ok) throw new Error(data.error ?? "候補生成に失敗しました。");

      setForm((current) => ({
        ...current,
        en: current.en.trim() ? current.en : data.english ?? "",
        zh: current.zh.trim() ? current.zh : data.chinese ?? ""
      }));
      setNotice("候補を入力しました。保存前に内容を確認してください。");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "候補生成でエラーが発生しました。");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            <Search size={24} />
          </div>
          <div>
            <h1 className="brandTitle">用語集</h1>
            <p className="brandSub">カテゴリー別に確認・追加・移行</p>
          </div>
        </div>
        <Link className="secondaryButton navButton" href="/">
          <ArrowLeft size={18} />
          戻る
        </Link>
      </header>

      <div className="stack">
        <section className="card panel glossaryPanel">
          <div className="glossaryHeader">
            <div>
              <h2 className="sectionTitle">用語を追加</h2>
              <p className="sectionSub">標準 {standardGlossary.length}件 / 追加 {customGlossary.length}件</p>
            </div>
            <div className="glossaryActions">
              <button className="copyButton" type="button" onClick={exportEntries} disabled={!customGlossary.length} title="追加用語をエクスポート">
                <Download size={18} />
              </button>
              <button className="copyButton" type="button" onClick={() => importRef.current?.click()} title="追加用語をインポート">
                <Upload size={18} />
              </button>
              <input
                ref={importRef}
                className="hiddenInput"
                type="file"
                accept="application/json,.json"
                onChange={(event) => void importEntries(event.target.files?.[0])}
              />
            </div>
          </div>

          <form className="glossaryForm" onSubmit={addEntry}>
            <div className="fieldGrid threeFields">
              <label className="field">
                <span className="label">日本語</span>
                <input
                  className="input"
                  value={form.ja}
                  onChange={(event) => setForm({ ...form, ja: event.target.value })}
                  placeholder="例: 補綴スペース"
                />
              </label>
              <label className="field">
                <span className="label">読み方</span>
                <input
                  className="input"
                  value={form.reading}
                  onChange={(event) => setForm({ ...form, reading: event.target.value })}
                  placeholder="例: ほてつスペース"
                />
              </label>
              <label className="field">
                <span className="label">English</span>
                <input
                  className="input"
                  value={form.en}
                  onChange={(event) => setForm({ ...form, en: event.target.value })}
                  placeholder="prosthetic space"
                />
              </label>
            </div>

            <div className="fieldGrid twoFields glossaryFormMeta">
              <label className="field">
                <span className="label">简体中文</span>
                <input
                  className="input"
                  value={form.zh}
                  onChange={(event) => setForm({ ...form, zh: event.target.value })}
                  placeholder="修复空间"
                />
              </label>
              <label className="field">
                <span className="label">カテゴリー</span>
                <select className="select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  {formCategories.map((item) => (
                    <option key={item} value={item}>
                      {getGlossaryCategoryLabel(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="label">候補生成API</span>
                <select className="select" value={provider} onChange={(event) => setProvider(event.target.value as ApiProvider)}>
                  {Object.entries(providerLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span className="label">メモ</span>
              <input className="input" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="必要なら補足" />
            </label>

            <div className="glossaryFormFooter">
              <label className="checkField">
                <input type="checkbox" checked={form.risk} onChange={(event) => setForm({ ...form, risk: event.target.checked })} />
                要確認に表示する
              </label>
              <div className="glossaryActions">
                <button className="secondaryButton compactButton" type="button" onClick={suggestTranslations} disabled={isSuggesting || !form.ja.trim()}>
                  <Sparkles size={18} />
                  {isSuggesting ? "生成中" : "候補生成"}
                </button>
                <button className="secondaryButton compactButton" type="submit">
                  <Plus size={18} />
                  追加
                </button>
              </div>
            </div>
          </form>

          {notice ? <p className="glossaryNotice">{notice}</p> : null}
        </section>

        <section className="card panel glossaryPanel">
          <div className="glossaryTools">
            <label className="field">
              <span className="label">カテゴリー</span>
              <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">すべて</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {getGlossaryCategoryLabel(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">検索</span>
              <span className="searchBox">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="日本語・英語・中国語で検索" />
              </span>
            </label>
          </div>

          <ul className="glossaryList">
            {filteredGlossary.map((entry) => {
              const isCustom = isCustomGlossaryEntry(entry);
              return (
                <li className="glossaryItem" key={entry.id}>
                  <div className="glossaryItemMain">
                    <span className="glossaryTerm">{entry.ja}</span>
                    {entry.reading ? <span className="glossaryReading">{entry.reading}</span> : null}
                    <span className="glossaryTranslation">
                      {entry.en} / {entry.zh}
                    </span>
                    {entry.note ? <span className="glossaryNote">{entry.note}</span> : null}
                  </div>
                  <div className="glossaryBadges">
                    <span className="glossaryBadge">{getGlossaryCategoryLabel(entry.category)}</span>
                    {entry.risk ? <span className="glossaryBadge warningBadge">要確認</span> : null}
                    <span className="glossaryBadge">{isCustom ? "追加" : "標準"}</span>
                    {isCustom ? (
                      <button className="copyButton smallIconButton" type="button" onClick={() => deleteEntry(entry.id)} title="追加用語を削除">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}

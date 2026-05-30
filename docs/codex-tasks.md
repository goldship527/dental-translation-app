# Codex 向け作業指示

このファイルは Codex に実装を依頼するためのタスクリスト。
上から順に着手する。各タスクは独立した PR / コミット単位で完結させる。

共通ルール:
- CLAUDE.md / AGENTS.md の作業ルールに従う（編集前に計画提示、小さく変更、dev-log.md に記録）
- 仕様の正本は `docs/spec.md`
- APIキー、個人情報、患者情報をコードへ書かない
- 変更後は `npm run typecheck` と `npm run build` を必ず通す

---

## Task 1: Gemini TTS のモデル名を実在モデルへ修正

### 目的
`gemini-3.1-flash-tts-preview` は公式に存在しない可能性が高い。実 API を叩いた瞬間に invalid model エラーになるため、実機検証より前に正す。

### 対象ファイル
- `lib/gemini.ts`
- `.env.example`
- `docs/spec.md`
- `README.md`

### 変更内容
1. Google AI の最新ドキュメントで提供中の TTS モデル名を確認する（候補: `gemini-2.5-flash-preview-tts`、`gemini-2.5-pro-preview-tts` など）。
2. `getGeminiTtsModel()` のフォールバック既定値を実在モデル名へ差し替える。
3. `.env.example`、`docs/spec.md` の `GEMINI_TTS_MODEL` 例、`README.md` の説明を同じ値に揃える。

### 検証
- `npm run typecheck` 成功
- `.env.local` の `GEMINI_TTS_MODEL` を未設定にした状態で TTS 再生 → 既定モデルで音声が返ることを確認
- `dev-log.md` に確定したモデル名を記録

### 注意
- `@google/genai` の SDK が要求する response modality (`AUDIO`) や `speechConfig` の仕様変更がないか合わせて確認する。
- Preview モデルは利用不可リージョンがあるので、利用可能リージョンも記録しておく。

---

## Task 2: 翻訳・文字起こしの race condition 対策

### 目的
ユーザーが連続で翻訳ボタンを押す、あるいは音声録音→原稿入力→ボタン押下のような操作をしたとき、後発リクエストより先発の遅延応答が後に返って画面を上書きする可能性がある。

### 対象ファイル
- `app/page.tsx`

### 変更内容
1. `translateText` と `transcribeRecording` で `AbortController` を使う。
   - `useRef<AbortController | null>` を 1 本持つ。
   - 新しいリクエスト開始時に既存をキャンセルし、`signal` を `fetch` へ渡す。
2. `setEnglishText` / `setChineseText` / `setJapaneseText` の更新は「自分のリクエストがキャンセルされていない」場合のみ実行する。
3. `AbortError` は `setError` の対象から除外する（ユーザー起因のキャンセルは無視）。

### 検証
- 1 リクエストの動作が変わらないこと
- 翻訳ボタンを 2 回連打 → 最後に押した応答だけが反映されること
- `npm run typecheck` 成功

### 注意
- AbortController をコンポーネントの unmount 時にもキャンセルする (`useEffect` クリーンアップ)。

---

## Task 3: localStorage の保存内容を初回マウントで復元

### 目的
現状は `localStorage.setItem` だけで、`getItem` していない。仕様の「最新翻訳結果を localStorage へ保存」が実質機能していない。

### 対象ファイル
- `app/page.tsx`

### 変更内容
1. 初回 `useEffect` で `dental-lecture-translator:last-result` を読み出す。
2. 値があれば `japaneseText` / `englishText` / `chineseText` を復元する。
3. 同時に `provider` / `mode` / `style` も保存・復元する（既に保存はしているので参照側を追加）。
4. JSON パース失敗時は無視し、エラーは出さない。

### 検証
- 翻訳実行 → ページリロード → 直前の結果が復元されることを確認
- 初回起動時（localStorage 空）で例外が出ないこと

### 注意
- 復元時に翻訳結果のクリア処理が走らないように `useEffect` の順序に注意する。

---

## Task 4: textarea 編集で翻訳結果をクリアしない

### 目的
日本語原稿を 1 文字でも編集すると英語・中国語が消えるため、誤字修正で結果が消える UX 問題がある。

### 対象ファイル
- `app/page.tsx`

### 変更内容
1. `setJapaneseText` の `onChange` から `setEnglishText("") / setChineseText("")` を削除する。
2. 代わりに「日本語原文と英・中翻訳が一致していない可能性」を UI で示す。
   - 例: 翻訳完了時点の日本語を `lastTranslatedJapaneseRef` などに保持。
   - 現在の `japaneseText` と異なる場合、English / 简体中文 カード上に「最新の入力と一致していない可能性があります」バッジを表示。
3. 録音再開ボタンを押したときには引き続き翻訳結果をクリアする（既存挙動を保持）。

### 検証
- 文字を 1 文字変えても英中の翻訳テキストが残ること
- 不一致時にバッジが出ること
- 録音開始時には翻訳結果がクリアされること

### 注意
- バッジ文言は CLAUDE.md / spec.md のトーンに揃える。

---

## Task 5: viewport の maximumScale を撤廃

### 目的
ピンチズーム禁止はアクセシビリティ的に推奨されない。会場で文字を拡大したい使用シーンとも合わない。

### 対象ファイル
- `app/layout.tsx`

### 変更内容
1. `viewport.maximumScale: 1` を削除する。
2. `userScalable` を明示的に設定しない（デフォルトの可変にする）。

### 検証
- スマホ実機でピンチズーム可能なこと
- レイアウト崩れがないこと

### 注意
- iOS Safari のダブルタップ拡大が必要かどうかは UX 判断。現時点では既定挙動に戻すだけでよい。

---

## Task 6: 起動時の API 利用可否プリチェック

### 目的
APIキーが未設定でも録音や翻訳ボタンが押せて、押した瞬間にエラーが出る。事前に表示する。

### 対象ファイル
- `app/api/health/route.ts` 新規
- `app/page.tsx`
- `lib/gemini.ts` / `lib/openai.ts`（既存関数を流用）

### 変更内容
1. `GET /api/health` を作成し、`{ gemini: boolean, openai: boolean }` を返す（キーの有無のみ判定、キー値は返さない）。
2. クライアント側で初回マウント時に取得し、選択中プロバイダで利用不可なら警告バナーを出す。
3. プロバイダ切替時に利用不可側だった場合の案内文言を `formatApiError` の方針に揃える。

### 検証
- 両方未設定 → 起動時にバナー表示、ボタン操作前に通知される
- 片方だけ設定 → 該当プロバイダ選択時のみ通知される
- 設定済み → バナーは出ない

### 注意
- ヘルスチェック結果でボタンを disable はしない（ユーザーが手動でキーを設定して再読込する余地を残す）。

---

## Task 7: 辞書をサーバー側で読み込みプロンプトに自動反映

### 目的
現状クライアントが辞書全件を取得し `slice(0, 120)` で切ってサーバーへ送るため、辞書末尾が無視され、無駄な帯域も発生する。

### 対象ファイル
- `app/api/translate/route.ts`
- `lib/prompts.ts`
- `app/page.tsx`（送信から `glossary` を削除）
- `public/data/dental-glossary.json`（変更なし）

### 変更内容
1. サーバーで `public/data/dental-glossary.json` を読み込むユーティリティを作成（`lib/glossary.ts`）。
   - Node 側で `fs.readFile` を使う、または `import` の JSON モジュールを使う。
   - 起動時 1 回だけ読み込み、メモリにキャッシュ。
2. `translate` ルートで、リクエストされた日本語テキストに `entry.ja` が含まれる項目のみ抽出してプロンプトへ入れる（最大 50 件程度に制限）。
3. クライアントは `glossary` を送らない。
4. クライアント側の `findRiskItems` 用の辞書取得は維持する（要確認ポイント表示はクライアント計算）。

### 検証
- `risk` 項目を含む長文を翻訳 → サーバーログ等で辞書がプロンプトへ入っていることを確認
- 該当用語のない短文 → glossary 行が空で送られないこと
- `npm run typecheck` 成功

### 注意
- 仕様書の「拡張方針: JSON 追加だけで用語拡張可能」を維持する。

---

## Task 8: 無音判定の閾値を環境変数化

### 目的
固定値だと実機マイクで誤検知が出る。Phase 1 の「閾値調整」を構造化する。

### 対象ファイル
- `app/page.tsx`
- `.env.example`
- `docs/spec.md`

### 変更内容
1. `NEXT_PUBLIC_SILENCE_MIN_DURATION` `NEXT_PUBLIC_SILENCE_PEAK` `NEXT_PUBLIC_SILENCE_RMS` `NEXT_PUBLIC_SILENCE_SPEECH_RATIO` を導入。
2. `isSilentRecording` の閾値を env から読む（未設定時は現行値）。
3. `.env.example` と `docs/spec.md` の「無音・誤認識対策」セクションに追記。

### 検証
- env 未設定で既存挙動と同じ
- 閾値を緩めて実機で誤検知が減ることを手元で確認

### 注意
- スマホブラウザは `NEXT_PUBLIC_` プレフィックスが必須。

---

## Task 9: Service Worker のキャッシュ更新戦略を改善

### 目的
現状 cache-first で、`CACHE_NAME` を上げない限り更新が反映されない。

### 対象ファイル
- `public/sw.js`
- 必要に応じて `app/page.tsx` または `lib/pwa.ts`

### 変更内容
1. `CACHE_NAME` の末尾バージョンをビルド時に書き換える仕組みを入れる（簡易には `package.json` の version を埋め込む手スクリプト、または現状の `v1` を `v2` 等へ上げる運用ルール）。
2. `fetch` ハンドラを「HTML はネットワーク優先、静的アセットはキャッシュ優先」へ分ける。
3. `/api/` パスを明示的にキャッシュ対象外にする。

### 検証
- 更新版アセットをデプロイ → リロード時に新しい HTML が来ること
- オフライン時に最低限の UI が起動すること

### 注意
- 講演本番中のオフライン挙動を壊さないこと。

---

## Task 10: テスト導入とユニットテスト追加

### 目的
現在テスト 0 件。`risk.ts` の用語マッチや WAV ヘッダ生成は重要な割に検証されていない。

### 対象ファイル
- `package.json`
- `tests/` 配下に新規
- 必要に応じて `vitest.config.ts` などの設定

### 変更内容
1. テストランナーを導入する（推奨: `vitest`、Next 環境と相性良）。
2. 以下のテストを追加する。
   - `lib/risk.ts`: 数値抽出、mm/Ncm、左右、上下顎、`risk: true` 用語、重複除去
   - `lib/audio.ts`: `wrapPcmAsWav` のヘッダバイト列が WAV 仕様に一致
   - `lib/api-errors.ts`: 503 / 429 / 401 / 403 / fetch failed が日本語化される
3. `package.json` に `test` スクリプトを追加。

### 検証
- `npm test` が緑
- CI ではなくローカル実行前提でよい

### 注意
- `@google/genai` や `openai` のモックは不要（ロジック関数のみ対象）。

---

## Task 11: サーバー側エラーログ追加

### 目的
現状 catch しても `console.error` していないため、Vercel ログから原因追跡ができない。

### 対象ファイル
- `app/api/transcribe/route.ts`
- `app/api/translate/route.ts`
- `app/api/speech/route.ts`

### 変更内容
1. catch ブロック内で `console.error("[translate]", error)` のようにルート名付きでログ出力する。
2. ユーザー向けレスポンスは現状の日本語メッセージのまま。
3. APIキー、リクエスト本文の生テキストはログに出さない（プライバシー優先）。

### 検証
- 意図的にエラーを発生させ、サーバーログにルート名と原因が出ること
- ユーザー応答に内部情報が漏れていないこと

### 注意
- CLAUDE.md の「患者情報・個人情報を扱わない」方針を守る。

---

## Task 12: ScriptProcessorNode から AudioWorkletNode へ移行

### 目的
`ScriptProcessorNode` は deprecated。長期的なブラウザ対応のため。

### 対象ファイル
- `app/page.tsx`
- `public/worklets/recorder-processor.js` 新規

### 変更内容
1. `recorder-processor.js` を作成し、入力サンプルを `port.postMessage` でメインスレッドへ送る。
2. `app/page.tsx` で `audioContext.audioWorklet.addModule(...)` → `AudioWorkletNode` を使う形に置き換える。
3. iOS Safari の AudioContext 初期化要件（ユーザー操作後に start）に注意。

### 検証
- 録音開始 → 停止 → 文字起こしまでが既存と同じ挙動
- iOS Safari、Android Chrome の主要バージョンで動作

### 注意
- このタスクは挙動変更リスクが他より高いため、Task 1-11 完了後に着手する。

---

## Task 13: ドキュメント整合性

### 目的
`docs/spec.md` と `docs/specification.md` が重複し、`src/` `tests/` が空。混乱の元になる。

### 対象ファイル
- `docs/specification.md`（削除）
- `src/`（削除または用途明示）
- `tests/`（Task 10 で使うので残す）

### 変更内容
1. `docs/spec.md` と `docs/specification.md` の差分を確認し、必要な記述があれば spec.md へマージしてから specification.md を削除。
2. `src/` ディレクトリの意図がない場合は削除。
3. `dev-log.md` に整理した旨を記録。

### 検証
- `npm run typecheck` と `npm run build` が成功
- ドキュメント参照リンクが切れていないこと

### 注意
- 削除はユーザー確認が必要（CLAUDE.md「削除前に確認」ルール）。Codex に依頼するときも、削除ではなく「削除予定リストの提示」までで一旦止める。

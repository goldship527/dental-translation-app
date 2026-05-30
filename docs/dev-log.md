# dev-log

## 運用ルール
- AI開発で重要な判断・変更・未解決事項をここに追記する
- 1作業ごとに日付見出しを作る
- 実際のコード変更はGit履歴も確認する

---

## 2026-05-14

### 初期設定
- プロジェクトフォルダを作成
- AGENTS.md を配置
- CLAUDE.md を配置
- docs/spec.md を作成

## 2026-05-21 共有文脈入口の追加

### 作業内容
- AGENTS.md と CLAUDE.md に Shared Context Engine の入口を追加した。
- 作業開始時に Obsidian 側の context-index.md を共有文脈入口として確認するルールを明記した。

### 判断
- Codex と Claude Code が同じ前提から作業を始められるようにするためのドキュメント更新。
- 実装コード、仕様内容、依存関係、秘密情報は変更していない。

## 2026-05-27 Webプロトタイプ初版

### 作業内容
- 静的HTML/CSS/JavaScriptで、ローカルブラウザ表示用の初版プロトタイプを作成した。
- 日本語入力、場面選択、翻訳先選択、デモ翻訳結果、よく使うフレーズ選択を実装した。
- 依存追加なしで起動できるNode製の簡易ローカルサーバーを追加した。
- 同じWi-Fi上のスマホから開くためのLAN内URLを、サーバー起動時に表示するようにした。
- GitHub Pages公開用に、ルートのindex.htmlと.gitignoreを追加した。
- READMEにローカル表示方法を追記した。
- docs/spec.mdにMVP仕様を追記した。

### 判断
- まず見せられる画面を優先し、外部翻訳APIや依存パッケージは追加しない。
- 患者情報や個人情報を入力しない注意を画面上に表示する。
- 実翻訳API連携は次フェーズで検討する。

## 2026-05-27 元アプリへの差し替え

### 作業内容
- Codexデフォルトフォルダ側に残っていた元アプリ `Dental Lecture Translator` を確認した。
- 元アプリの場所: `C:\Users\topro\Documents\Codex\2026-05-12\1-ui-openai-api-2-phase`
- 通常の開発場所 `C:\Dev\dental-translation-app` に、元アプリのNext.js構成をコピーした。
- 簡易フレーズ翻訳デモの `src/` とルート `index.html` は削除した。
- 元仕様 `docs/specification.md` を標準の `docs/spec.md` に反映した。

### 判断
- このプロジェクトの実体は、歯科医院の定型文翻訳ではなく、歯科講演・教育・Q&A向けの音声/原稿翻訳PWAである。
- `.env.local`、`.next`、`node_modules`、`tsconfig.tsbuildinfo` はコピーしない。
- APIキーは `.env.local` に置き、GitHubへpushしない。
- GitHub PagesではAPIルートが動かないため、外部公開はVercelまたはRenderなどNext.js対応環境を使う。

### 確認
- `npm.cmd install` を実行し、依存関係をローカルにインストールした。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- `npm.cmd audit --audit-level=moderate` で moderate 3件を確認。`postcss` は Next.js 経由、`ws` は依存経由。`npm audit fix --force` は破壊的変更を含む可能性があるため未実行。

## 2026-05-29 Gemini TTS モデル名確認

### 作業内容
- Task 1 の事前確認として Google AI 公式ドキュメントを確認した。
- `gemini-3.1-flash-tts-preview` は 2026-05-29 時点で Gemini 3.1 Flash TTS Preview の実在モデルとして掲載されていることを確認した。
- `lib/gemini.ts`、`.env.example`、`README.md`、`docs/spec.md` の既定値はすでに `gemini-3.1-flash-tts-preview` で揃っていたため、コードと設定例は変更しない判断にした。

### 判断
- 既定の Gemini TTS モデルは `gemini-3.1-flash-tts-preview` を維持する。
- Preview モデルのため、利用不可やリージョン制約が出た場合は `.env.local` の `GEMINI_TTS_MODEL` で `gemini-2.5-flash-preview-tts` などの公式掲載モデルへ切り替えられる運用とする。
- TTS の `responseModalities: ["AUDIO"]` と `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName` の使い方は、現行の公式 JavaScript 例と整合している。

### 参照
- https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-tts-preview
- https://ai.google.dev/gemini-api/docs/speech-generation

## 2026-05-29 翻訳・文字起こしの race condition 対策

### 作業内容
- `app/page.tsx` に `AbortController` を保持する `activeRequestControllerRef` を追加した。
- 翻訳リクエストと文字起こしリクエストの開始時に、実行中の古いリクエストをキャンセルするようにした。
- `/api/translate` と `/api/transcribe` の `fetch` に `signal` を渡し、キャンセル済みリクエストの応答では画面状態を更新しないようにした。
- `AbortError` はユーザー向けエラー表示に出さないようにした。
- コンポーネントのアンマウント時に実行中リクエストをキャンセルするようにした。

### 判断
- 翻訳と文字起こしは同じ画面結果を更新するため、AbortController は 1 本に集約した。
- 録音後の文字起こしが成功した場合は、その結果を日本語欄に反映してから翻訳リクエストへ進む。翻訳開始時に文字起こし側の controller はキャンセルされるが、文字起こし処理自体はすでに完了済みのため問題ない。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 localStorage 復元対応

### 作業内容
- `app/page.tsx` で保存済みの `dental-lecture-translator:last-result` を初回マウント時に読み込むようにした。
- 保存済みの日本語原文、英訳、中国語訳、provider、mode、style を復元するようにした。
- JSON パース失敗や想定外の値は無視し、初回起動を妨げないようにした。

### 判断
- provider、mode、style は許可された値だけを復元する。
- localStorage の破損はユーザー操作で直せる一時状態として扱い、エラー表示は出さない。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 textarea 編集時の翻訳結果保持

### 作業内容
- `app/page.tsx` で日本語原稿 textarea の編集時に英訳・中国語訳をクリアしないようにした。
- 翻訳完了時点の日本語原稿を `lastTranslatedJapaneseText` として保持し、現在の入力と異なる場合に翻訳結果カードへ注意バッジを表示するようにした。
- localStorage から復元した結果は、復元直後に不要な注意バッジが出ないよう、保存済み日本語を最後に翻訳した原稿として扱うようにした。
- 録音開始時は既存挙動どおり翻訳結果をクリアし、最後に翻訳した原稿もリセットするようにした。
- 注意バッジ用のスタイルを `app/globals.css` に追加した。

### 判断
- バッジ文言は「最新の入力と一致していない可能性があります」とし、翻訳結果を消さずに利用者へ状態を知らせる。
- 注意バッジは English / 简体中文 の翻訳カードだけに表示し、日本語原文カードには表示しない。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 viewport の maximumScale 撤廃

### 作業内容
- `app/layout.tsx` の `viewport.maximumScale: 1` を削除した。
- `userScalable` は明示せず、ブラウザ既定のズーム可能状態に戻した。

### 判断
- 講演会場やスマホ利用時に文字を拡大できるよう、ピンチズームを禁止しない方針にした。
- レイアウト側の大きな変更は行わず、アクセシビリティ上の制限解除だけに留めた。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 起動時の API 利用可否プリチェック

### 作業内容
- `app/api/health/route.ts` を追加し、Gemini / OpenAI のAPIキー有無を `{ gemini: boolean, openai: boolean }` で返すようにした。
- `app/page.tsx` の初回マウント時に `/api/health` を取得し、選択中プロバイダのキーが未設定なら警告バナーを表示するようにした。
- 警告バナー用のスタイルを `app/globals.css` に追加した。

### 判断
- ヘルスチェックではAPIキーの有無だけを判定し、キー値やリクエスト本文は返さない。
- 警告が出ていても録音・翻訳ボタンは disable しない。利用者が `.env.local` を設定して再読み込みできる余地を残す。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 辞書のサーバー側読み込み対応

### 作業内容
- `lib/glossary.ts` を追加し、`public/data/dental-glossary.json` をサーバー側で読み込んでメモリキャッシュするようにした。
- `app/api/translate/route.ts` で、翻訳対象の日本語に含まれる `entry.ja` だけを最大50件抽出してプロンプトへ渡すようにした。
- `app/page.tsx` の翻訳リクエストから `glossary` 送信を削除した。
- クライアント側の辞書読み込みは、要確認ポイント表示のため維持した。
- `lib/prompts.ts` で、該当用語がない場合は glossary セクションを出さないようにした。

### 判断
- 用語辞書は JSON 追加だけで拡張できる構成を維持する。
- クライアントから全件送る方式をやめ、辞書末尾が `slice(0, 120)` で無視される問題と不要な通信量を減らす。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 無音判定閾値の環境変数化

### 作業内容
- `app/page.tsx` の無音判定で使う録音時間、ピーク音量、RMS音量、発話らしい音の割合の閾値を `NEXT_PUBLIC_` 環境変数から読めるようにした。
- 未設定または数値として不正な値の場合は、既存の固定値と同じ既定値を使うようにした。
- `.env.example` に無音判定用の環境変数例を追加した。
- `docs/spec.md` の無音・誤認識対策セクションに、調整可能な環境変数と既定値を追記した。

### 判断
- スマホブラウザ側で参照するため、環境変数名は `NEXT_PUBLIC_` プレフィックス付きにした。
- `getAudioStats` 内で発話らしいサンプルを数える内部閾値 `0.018` は、今回の指定範囲外のため維持した。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 Service Worker キャッシュ戦略改善

### 作業内容
- `public/sw.js` の `CACHE_NAME` を `package.json` の現行 version に合わせた `dental-lecture-translator-v0.1.0` へ変更した。
- `/api/` パスは明示的に Service Worker のキャッシュ対象外にした。
- HTML / ナビゲーションリクエストはネットワーク優先にし、オフライン時はキャッシュへフォールバックするようにした。
- 静的アセットはキャッシュ優先にし、初回取得後に同一キャッシュへ保存するようにした。

### 判断
- 講演本番中の最低限のオフライン起動を残しつつ、HTML更新が cache-first で固定され続ける問題を避ける。
- ビルド時自動書き換えスクリプトは導入せず、現段階では `package.json` version と `CACHE_VERSION` を揃える運用に留めた。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- 実ブラウザでの Service Worker 更新・オフライン挙動確認は未実施。

## 2026-05-29 テスト導入とユニットテスト追加

### 作業内容
- 開発依存に `vitest` を追加した。
- `package.json` に `test: vitest run` を追加した。
- `vitest.config.ts` を追加し、Next.js と同じ `@` パスエイリアスをテストでも解決できるようにした。
- `tests/risk.test.ts` を追加し、数値、mm/Ncm、左右、上下顎、禁忌・適応、`risk: true` 用語、重複除去を検証した。
- `tests/audio.test.ts` を追加し、`wrapPcmAsWav` のWAVヘッダを検証した。
- `tests/api-errors.test.ts` を追加し、503 / 429 / 401 / 403 / fetch failed の日本語化とステータス変換を検証した。

### 判断
- 外部APIやSDKのモックは導入せず、重要な純粋ロジック関数だけを対象にした。
- 既存の moderate 脆弱性3件は確認されたが、破壊的変更を避けるため `npm audit fix --force` は実行しない。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 サーバー側エラーログ追加

### 作業内容
- `app/api/translate/route.ts` の catch ブロックに `console.error("[translate]", error)` を追加した。
- `app/api/transcribe/route.ts` の catch ブロックに `console.error("[transcribe]", error)` を追加した。
- `app/api/speech/route.ts` の catch ブロックに `console.error("[speech]", error)` を追加した。

### 判断
- Vercel などのサーバーログで原因追跡しやすいよう、ルート名付きでログを出す。
- APIキー、リクエスト本文、翻訳対象テキスト、音声データは明示的にログへ出さない。
- ユーザー向けレスポンスは従来の日本語エラーメッセージを維持する。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 ドキュメント整合性整理

### 作業内容
- `docs/spec.md` と `docs/specification.md` の差分を確認した。
- `docs/spec.md` のみが最新の無音判定環境変数の記述を含んでおり、`docs/specification.md` は古い重複仕様だったため削除した。
- 空の `src/` ディレクトリを削除した。
- `tests/` は Task 10 で追加したテストを含むため残した。
- `docs/specification.md` や `src/` への参照が残っていないことを確認した。

### 判断
- 実装仕様の正本は `docs/spec.md` に一本化する。
- Next.js App Router 構成では `app/` と `lib/` を主な実装場所とし、空の `src/` は残さない。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 AudioWorkletNode への録音処理移行

### 作業内容
- `public/worklets/recorder-processor.js` を追加し、`AudioWorkletProcessor` で入力音声サンプルを `Float32Array` としてメインスレッドへ送るようにした。
- `app/page.tsx` の録音処理を `ScriptProcessorNode` から `AudioWorkletNode` へ置き換えた。
- 録音開始時に `audioContext.audioWorklet.addModule("/worklets/recorder-processor.js")` を実行し、`AudioWorkletNode` の `port.onmessage` で録音チャンクを蓄積するようにした。
- 録音停止時に `port.onmessage` の解除、`workletNode.disconnect()`、`source.disconnect()`、`stream` の track stop、`audioContext.close()` を行うようにした。
- `AudioWorkletNode` 非対応または worklet 初期化失敗時に、日本語エラーを表示するようにした。
- コンポーネントのアンマウント時にも録音リソースを解放するようにした。

### 判断
- deprecated な `ScriptProcessorNode` への fallback は残さず、AudioWorklet 非対応ブラウザでは明示的にエラーを出す方針にした。
- WAV化、無音判定、文字起こし、AbortController、localStorage復元、API health check、翻訳結果保持バッジの既存フローは維持した。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- `npm.cmd run dev` で起動し、`http://localhost:3000`、`/worklets/recorder-processor.js`、`/api/health` が 200 で返ることを確認した。

### 残リスク
- マイク権限を伴う実録音、iOS Safari、Android Chrome の実機確認は未実施。

## 2026-05-29 AudioWorkletNode 移行レビュー対応

### 作業内容
- iOS Safari で `AudioContext` が `suspended` に戻る可能性に備え、録音開始時に `audioContext.resume()` を必要に応じて呼ぶようにした。
- `audioWorklet.addModule("/worklets/recorder-processor.js")` の失敗を専用エラー `RecorderWorkletLoadFailed` に変換し、日本語エラーを安定して表示できるようにした。
- 録音停止時の `audioContext.close()` に `.catch(() => undefined)` を付け、close失敗で後続のWAV化・文字起こし処理が止まらないようにした。
- 録音用 `AudioWorkletNode` の `audioContext.destination` への接続を削除した。

### 判断
- 実機録音前に、iOS Safari と worklet 読み込み失敗時の典型的な不安定要因を先に潰す。
- `ScriptProcessorNode` fallback は引き続き残さず、AudioWorklet 非対応時は明示的にエラーを表示する。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。

## 2026-05-29 インプラント系用語集の初期追加

### 作業内容
- 公開資料を参考に、インプラント講義で頻出しやすい用語を public/data/dental-glossary.json に追加した。
- 既存の用語を残し、インプラント体、アバットメント、骨結合、即時埋入、上顎洞底挙上術、サイナスリフト、ソケットリフト、インプラント周囲炎などを追加した。
- 数値、単位、術式選択、解剖部位、合併症に関わる語は risk: true として要確認表示の対象にした。

### 判断
- 用語集は今後増やせるよう、既存の JSON 形式を維持した。
- 中国語は簡体字表記で統一した。
- シュナイダー膜は講義で使われる可能性があるため登録しつつ、正式表現としては上顎洞粘膜を優先する旨を note に残した。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。

## 2026-05-29 用語集追加・インポート/エクスポートUI

### 作業内容
- app/page.tsx に用語集セクションを追加し、標準用語と追加用語をカテゴリー別・検索付きで確認できるようにした。
- 追加用語フォームを追加し、日本語、英語、簡体字中国語、カテゴリー、risk、メモを localStorage に保存できるようにした。
- 追加用語のみ削除できるようにし、削除前に確認ダイアログを出すようにした。
- 追加用語のJSONエクスポートとインポートを追加し、別端末へ手動で移せるようにした。
- 翻訳時は入力文に含まれる追加用語だけを /api/translate に渡し、標準用語集と合わせてプロンプトに反映するようにした。
- app/globals.css に用語集画面用のスタイルを追加した。

### 判断
- 標準用語集は編集不可、ユーザー追加用語だけを編集対象にした。
- 端末間同期は外部DBではなく、まずJSONエクスポート/インポートの手動運用にした。
- APIキー、患者名、医院名、会社の非公開情報を用語集に入れない注意文をUIに表示した。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。
- npm.cmd run build 成功。
- npm.cmd run dev で起動し、http://localhost:3000、/api/health、/worklets/recorder-processor.js が 200 で返ることを確認した。
- Browserプラグインによる視覚確認は、ブラウザ接続の環境エラーで未実施。

## 2026-05-29 用語集ページ分離と候補生成

### 作業内容
- メイン翻訳画面から用語集管理セクションを外し、/glossary に用語集専用ページを追加した。
- メイン画面のヘッダーに用語集ページへの移動ボタンを追加した。
- 追加用語の localStorage 保存、JSONインポート/エクスポート、削除、カテゴリー別表示、検索を /glossary 側へ移した。
- 用語追加フォームに候補生成ボタンを追加し、日本語用語から英語・簡体字中国語の候補を /api/translate 経由で入力できるようにした。
- 追加用語の読み込みと翻訳プロンプト反映、要確認ポイント反映はメイン画面で維持した。
- 画面上の注意文・免責フッターを削除した。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。
- npm.cmd run build 成功。
- 開発サーバーを再起動し、http://localhost:3000 と http://localhost:3000/glossary が 200 で返ることを確認した。

## 2026-05-29 要確認欄の文言改善

### 作業内容
- メイン画面下部の見出しを「要確認ポイント」から「翻訳後に確認する項目」へ変更した。
- 空欄時の説明文を、数字、単位、左右、上下顎、術式、禁忌・適応などの確認用であることが分かる文言に変更した。

### 確認
- npm.cmd run typecheck 成功。

## 2026-05-29 用語集の読み方対応と第2弾追加

### 作業内容
- DentalGlossaryEntry に reading フィールドを追加した。
- 用語集ページの追加フォーム、検索、一覧表示、JSONインポート/エクスポートを reading に対応させた。
- 翻訳プロンプトの用語集行に reading があれば含めるようにした。
- 既存用語のうち読み方が明確な44語に reading を追加した。
- インプラント関連第2弾として、補綴、外科、骨造成、合併症、デジタル、解剖系の40語を読み方付きで追加した。

### 判断
- 「骨」のように単体だと読みが揺れる語は避け、骨造成、歯槽骨、骨補填材など専門語の複合語を中心に登録した。
- 数値、術式、解剖部位、合併症に関わる語は risk: true とした。

### 確認
- 用語集は86語、id重複なし、日本語用語重複なし。
- reading 登録は84語。
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。
- npm.cmd run build 成功。

## 2026-05-29 略語用語の読み方補完

### 作業内容
- Ncm の reading を「にゅーとん」として追加した。
- GBR の reading を「じーびーあーる」として追加した。

### 判断
- Ncm は正式には Newton centimeter の単位だが、講義上の読み補助としては一般的にセンチメートルまで読まず「ニュートン」と扱う方針にした。

### 確認
- 用語集86語すべてに reading が入っていることを確認した。
- npm.cmd run typecheck 成功。

## 2026-05-29 インプラント系300語レビュー候補作成

### 作業内容
- docs/glossary-candidates-implant-300.md を追加した。
- 既存標準用語86語と新規候補214語を合わせ、レビュー用に300語の表へ整理した。
- 各行に source、category、ja、reading、en、zh、risk、note を付けた。
- 本番用語集 public/data/dental-glossary.json には未反映で、確認後に取り込む候補として扱う。

### 確認
- レビュー表は300行。日本語用語の重複なし。
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。
- npm.cmd run build 成功。

## 2026-05-30 メーカー名・インプラントシステム名を含む用語集拡充

### 作業内容
- docs/glossary-candidates-implant-300.md の未反映候補を public/data/dental-glossary.json へ取り込んだ。
- 歯科講演・Q&Aで固有名詞として出やすい主要歯科メーカー、主要インプラントメーカー、代表的なインプラントシステム名、表面性状、接続様式を標準用語集へ追加した。
- 用語集ページのカテゴリー表示に bone / sinus / soft / occlusion / maintenance / manufacturer / implant_system / implant_surface / connection を追加した。

### 判断
- ブランド名やシステム名は原則として翻訳せず、英語・中国語でも固有名詞を保持する方針にした。
- 表面性状、接続様式、材料名など、コンポーネント互換性や臨床判断に関わりやすい語は risk: true として要確認表示の対象にした。
- 患者名、医院名、会社の非公開情報、APIキーは追加していない。

### 確認
- 標準用語集は 86語から 409語へ増加した。
- 今回追加: 323語。カテゴリー別: implant 25語、surgery 47語、bone 30語、sinus 11語、soft 16語、prosthetics 28語、occlusion 12語、anatomy 12語、complication 17語、maintenance 10語、digital 6語、manufacturer 39語、implant_system 51語、implant_surface 12語、connection 7語。
- id 重複なし、日本語用語重複なし、必須フィールド欠けなし、reading 欠けなしを確認した。
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。

## 2026-05-30 用語集レビュー結果の修正反映

### 作業内容
- Claude によるレビューを受け、`public/data/dental-glossary.json` の表記揺れ2件を修正した。
  - `implant_surface_003` Roxolid: reading を `ろくそりど` から `ろきそりっど` に修正した。
  - `implant_system_049` Dentium SuperLine 片仮名バリアント: ja を `スーパライン` から `スーパーライン` に修正した(長音符の欠落を補正)。
- ジンヴィ (`manufacturer_007/008`) と TiUnite (`implant_surface_004`) は現状のまま維持した。

### 判断
- Roxolid は国内代理店資料で「ロキソリッド」表記が一般的なため、講演 TTS と検索一致の安定性を優先して reading を寄せた。
- 「スーパーライン」は Dentium SuperLine の国内表記として一般的で、長音符抜けは単なる誤記とみなした。en/zh ("Dentium SuperLine") は変更不要。
- ジンヴィ・TiUnite の現行 reading は許容範囲内のためそのまま運用する。

### 確認
- Read 経由で `public/data/dental-glossary.json` の該当2行と末尾構造(`]` 終端)を確認した。
- 総数 409語、id 重複なし、ja 重複なし、reading 欠けなしを維持。
- Windows ホスト側で npm.cmd test 成功。3ファイル、8テストが成功。
- Windows ホスト側で npm.cmd run typecheck 成功。
- Windows ホスト側で npm.cmd run build 成功。



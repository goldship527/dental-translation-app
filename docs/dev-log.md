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

## 2026-08-07 朝礼反映

### 現在の状態
- 日本語録音を5秒単位で処理し、録音停止前に文字起こしプレビューを表示できる状態。

### 完了
- 済: 日本語録音中プレビューを追加する。（TypeScript型確認成功）

### 次のアクション
- 録音中プレビューの遅延を実機で確認し、必要に応じて処理間隔と表示を調整する。

### 条件付き・保留
- Web Speech API／Realtime API／Live APIの比較と、Q&A向け区切り操作の改善。

### 確認
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run build` 成功。

### 承認・確認待ち
- なし

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

- 開発サーバーを再起動し、http://localhost:3000 が 200 で返ることを確認した。
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

## 2026-05-30 翻訳履歴の追加

### 作業内容
- メイン画面に翻訳履歴パネルを追加した。
- 翻訳成功時に、日本語原文、英語訳、簡体中国語訳、API、モード、翻訳スタイル、保存日時を localStorage に保存するようにした。
- 履歴は直近20件まで保持し、同じ日本語・英語・中国語の組み合わせは新しい履歴として前方へ寄せるようにした。
- 履歴から翻訳結果を復元できるようにした。
- 履歴の1件削除と全削除を追加した。
- docs/spec.md に翻訳履歴仕様を追記した。

### 判断
- まずは外部DBや同期を使わず、講演中に直近の翻訳へ戻れる localStorage ベースのMVPとした。
- 復元時は日本語・英語・中国語だけでなく、provider / mode / style も当時の状態へ戻す。
- 患者情報、個人情報、医院名、会社の非公開情報を入力しない運用は従来どおり維持する。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。

## 2026-05-30 起動時の前回結果自動復元を無効化

### 作業内容
- 起動時に `dental-lecture-translator:last-result` を読み込んで日本語入力欄・翻訳結果へ自動復元する処理を削除した。
- 翻訳履歴の読み込みは維持し、過去の結果を使う場合は履歴から明示的に復元する形にした。
- docs/spec.md の保存仕様と翻訳履歴仕様を、空欄スタートの方針に合わせて更新した。

### 判断
- 講演前やデモ時に過去のテスト文・誤認識文が初期表示されるのを避けるため、起動時は空欄スタートにする。
- 履歴からの明示的な復元は残すため、過去翻訳へ戻る導線は維持する。
- 前回テキストの自動表示を止めることで、個人情報や不要な入力内容が画面に残るリスクも下げる。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。

## 2026-05-30 お気に入り翻訳の追加

### 作業内容
- メイン画面にお気に入りパネルを追加した。
- 現在表示中の翻訳をお気に入りへ保存できるようにした。
- 翻訳履歴の各項目からお気に入りへ保存できるようにした。
- お気に入りから翻訳結果を復元できるようにした。
- お気に入りの1件削除と全削除を追加した。
- docs/spec.md にお気に入り仕様を追記した。

### 判断
- 翻訳履歴は流れていく一時記録、お気に入りは講演前・本番で使いたい固定保存として分ける。
- 外部DBや同期は導入せず、まずは端末内 localStorage に保存する。
- 同じ日本語原文、英語訳、簡体中国語訳の組み合わせは重複保存しない。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。

## 2026-05-30 翻訳履歴の検索・絞り込み追加

### 作業内容
- 翻訳履歴パネルに検索欄を追加した。
- 日本語原文、英語翻訳、簡体中国語翻訳、API、モード、翻訳スタイル、保存日時を検索対象にした。
- APIプロバイダ別の絞り込みを追加した。
- 翻訳モード別の絞り込みを追加した。
- 絞り込み結果件数と全履歴件数を表示するようにした。
- docs/spec.md に翻訳履歴の検索・絞り込み仕様を追記した。

### 判断
- 履歴の保存形式は変えず、表示時だけ検索・絞り込みする。
- 絞り込み中でも「全削除」は保存済み履歴全体に対して実行する。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。
- 開発サーバーを起動し、http://localhost:3000 が 200 で返ることを確認した。

## 2026-05-30 お気に入り翻訳の検索・絞り込み追加

### 作業内容
- お気に入りパネルに検索欄を追加した。
- 日本語原文、英語翻訳、簡体中国語翻訳、API、モード、翻訳スタイル、保存日時を検索対象にした。
- APIプロバイダ別の絞り込みを追加した。
- 翻訳モード別の絞り込みを追加した。
- 絞り込み結果件数と全お気に入り件数を表示するようにした。
- docs/spec.md にお気に入りの検索・絞り込み仕様を追記した。

### 判断
- お気に入りの保存形式は変えず、表示時だけ検索・絞り込みする。
- 絞り込み中でも「全削除」は保存済みのお気に入り全体に対して実行する。

### 確認
- npm.cmd test 成功。3ファイル、8テストが成功。
- npm.cmd run typecheck 成功。初回はサンドボックス制限で tsconfig.tsbuildinfo を書けず失敗したため、通常権限で再実行した。
- npm.cmd run build 成功。


## 2026-06-02 講演動画ローカライズ方針の追加

### 作業内容
- docs/spec.md に、Keynoteで録画された日本語講演MP4を英語ナレーション付きMP4へ変換する講演動画ローカライズ方針を追記した。
- MVP入力をMac上の録画済みMP4、MVP出力を英語ナレーション入りMP4、英語字幕、日本語文字起こし、英訳原稿、要確認リスト、配布用パッケージと定義した。
- 動画処理はMacローカルのffmpeg利用を基本とし、文字起こし、翻訳、TTSは既存のGemini / OpenAI連携を活用する方針にした。
- 講演者に似た声の生成は、本人同意あり前提で後フェーズのAPI連携として扱うことを明記した。

### 判断
- 既存アプリの強みである文字起こし、歯科専門翻訳、用語集、要確認ポイント、TTSを活かして、講演動画の英語版作成システムへ拡張する。
- 動画ファイルは容量と機密性のリスクが大きいため、動画全体を常に外部APIへ送るのではなく、ローカルで音声抽出・動画合成を行い、必要な音声・テキスト処理だけAPIを使う方針にする。
- 初期MVPでは標準TTSを使い、講演者本人に似た声の生成は、同意状況と利用範囲を明確に管理できる段階で実装する。

### 確認
- 今回は仕様追記のみ。コード変更、依存関係追加、テスト実行はなし。

## 2026-06-02 動画ローカライズ画面の初期実装

### 作業内容
- `app/video/page.tsx` を追加し、Keynote録画MP4を選択できる動画ローカライズ画面を作成した。
- 選択したMP4のファイル名、容量、長さ、解像度を表示するようにした。
- 選択したMP4をブラウザ内でプレビュー再生できるようにした。
- メイン画面ヘッダーに `/video` への「動画」ボタンを追加した。
- `app/globals.css` に動画ローカライズ画面用のスタイルを追加した。
- docs/spec.md に、動画ローカライズ画面のMP4選択・ファイル情報表示を実装済み範囲として追記した。

### 判断
- 初回実装では、動画処理やAPI送信は行わず、ローカルMP4の選択と確認に限定した。
- 次の実装単位は、Macローカルのffmpegを使った音声抽出の設計と実装にする。
- 4GBを超える動画は初期MVPの検証対象外として、短い講演動画から確認する方針にした。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` と `.next/types` を参照できず失敗したため、通常権限で再実行した。
- `npm.cmd run build` 成功。`/video` が静的ページとして生成された。
- 開発サーバーを起動し、`http://localhost:3000` と `http://localhost:3000/video` が 200 で返ることを確認した。
- Browserプラグインによる視覚確認は、ブラウザ接続側の環境エラーで未実施。

## 2026-06-02 ffmpeg確認とWAV音声抽出の追加

### 作業内容
- `.gitignore` に `work` を追加し、動画ローカライズの中間ファイルをGit管理対象外にした。
- `lib/video.ts` を追加し、Macローカルの `ffmpeg` / `ffprobe` 確認と、MP4から16kHz mono WAVを抽出する処理を実装した。
- `app/api/video/ffmpeg-check/route.ts` を追加し、画面からffmpeg利用可否を確認できるようにした。
- `app/api/video/extract-audio/route.ts` を追加し、MP4を `work/video-localization/<jobId>` に保存してWAVへ抽出できるようにした。
- `/video` 画面にffmpegステータス、再確認ボタン、音声抽出ボタン、抽出後の元動画コピーとWAVのパス表示を追加した。
- docs/spec.md に、作業フォルダ、WAV抽出、元動画を上書きしない方針、英語版では日本語音声を完全差し替えする方針を追記した。

### 判断
- 日本語の元動画は保持し、英語版動画は別ファイルとして作成する。元動画は上書きしない。
- 初期MVPでは、ブラウザ経由で扱える短い検証動画を対象にするため、アップロード上限を1GBにした。
- 抽出音声は、文字起こしAPIへ渡しやすい 16kHz / mono / PCM WAV とした。
- 次の実装単位は、抽出済みWAVを既存の文字起こし処理へ接続すること。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` と `.next/types` を参照できず失敗したため、通常権限で再実行した。
- `npm.cmd run build` 成功。`/api/video/extract-audio` と `/api/video/ffmpeg-check` がAPIルートとして生成された。
- 開発サーバー上で `http://localhost:3000/video` が 200 で返ることを確認した。
- 開発サーバー上で `http://localhost:3000/api/video/ffmpeg-check` が 200 で返ることを確認した。現在のWindows環境では `ffmpeg` / `ffprobe` 未導入のため `ready:false`。
- 実際のWAV抽出は、Mac側に `ffmpeg` をインストールした環境で確認する必要がある。

## 2026-06-02 抽出済みWAVの全文文字起こし接続

### 作業内容
- 既存の `/api/transcribe` 内にあったGemini / OpenAI文字起こし処理を `lib/transcription.ts` へ切り出した。
- `app/api/transcribe/route.ts` を、共通文字起こし関数を使う形へ整理した。
- `lib/video.ts` に、`jobId` とWAVファイル名から `work/video-localization` 配下の抽出済みWAVだけを読み込む関数を追加した。
- `app/api/video/transcribe-audio/route.ts` を追加し、抽出済みWAVをGemini / OpenAIで日本語全文文字起こしできるようにした。
- `/video` 画面に文字起こしAPI選択、全文文字起こしボタン、編集可能な日本語全文テキスト欄を追加した。
- docs/spec.md に、抽出済みWAVから全文文字起こしまでを実装済み範囲として追記した。

### 判断
- まずは全文文字起こしとして表示し、スライド単位・字幕単位の分割は次フェーズで扱う。
- 動画文字起こしAPIでは、作業フォルダ外のパスを直接指定できないよう、`jobId` とWAVファイル名から安全に解決する方針にした。
- 録音音声と動画抽出音声で文字起こしプロンプトを揃えるため、共通関数へ切り出した。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` と `.next/types` を参照できず失敗したため、ビルド後に通常権限で再実行した。
- `npm.cmd run build` 成功。`/api/video/transcribe-audio` がAPIルートとして生成された。
- 開発サーバー上で `http://localhost:3000/video` が 200 で返ることを確認した。
- `http://localhost:3000/api/video/transcribe-audio` は空リクエストに対して 400 を返し、入力チェックが働くことを確認した。
- 実際の動画WAV文字起こしは、Mac側で `ffmpeg` とAPIキーを設定した環境で確認する必要がある。

## 2026-06-02 動画文字起こし全文の英訳接続

### 作業内容
- `/video` 画面に、日本語全文文字起こしを既存の `/api/translate` へ送って英訳する処理を追加した。
- 英訳は `mode: script`、`style: professional` で実行するようにした。
- 追加用語集のうち、全文文字起こしに含まれる用語を翻訳リクエストへ渡すようにした。
- 英訳結果を編集可能な「英訳原稿」欄として表示するようにした。
- 日本語文字起こしを編集した場合は、古い英訳原稿をクリアするようにした。
- docs/spec.md に、全文文字起こしから全文英訳までを実装済み範囲として追記した。

### 判断
- 初期MVPでは、全文をまとめて英訳する。字幕単位・スライド単位への分割は後フェーズで扱う。
- 既存の翻訳APIと歯科用語集プロンプトを活用し、新しい動画専用翻訳APIは追加しない。
- 英語版動画へ進む前に、人が全文の文字起こしと英訳を確認・修正できる形を優先する。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` と `.next/types` を参照できず失敗したため、ビルド後に通常権限で再実行した。
- `npm.cmd run build` 成功。
- 開発サーバー上で `http://localhost:3000/video` が 200 で返ることを確認した。
- `/api/translate` は空リクエストに対して 400 を返し、入力チェックが働くことを確認した。
- 実際の全文英訳は、Mac側で `ffmpeg`、APIキー、短い検証MP4を用意した環境で確認する必要がある。

## 2026-06-02 標準TTS英語ナレーション生成の追加

### 作業内容
- 既存の `/api/speech` 内にあったTTS生成処理を `lib/speech.ts` へ切り出した。
- `/api/speech` を、共通TTS生成関数を使う形へ整理した。
- `lib/video.ts` に、英語ナレーション音声を `work/video-localization/<jobId>` へ保存し、読み出す関数を追加した。
- `app/api/video/generate-narration/route.ts` を追加し、英訳原稿から標準TTSの英語ナレーション音声を生成して保存できるようにした。
- `app/api/video/narration-audio/route.ts` を追加し、保存済みナレーション音声をブラウザで再生できるようにした。
- `/video` 画面に「英語ナレーション生成」ボタン、音声プレイヤー、保存パス表示を追加した。
- docs/spec.md に、標準TTS英語ナレーション生成を実装済み範囲として追記した。

### 判断
- 初期MVPでは、全文英訳を標準TTSで1本の英語音声として生成する。
- 講演者本人に似た声のAPI連携は後フェーズに残す。
- 既存の通常読み上げと動画ナレーションでTTS処理を共通化し、provider別の実装差分を1箇所に寄せた。
- 長文TTSはAPI制限に当たる可能性があるため、初期MVPでは4096文字以内の短い検証動画を対象にする。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` と `.next/types` を参照できず失敗したため、ビルド後に通常権限で再実行した。
- `npm.cmd run build` 成功。`/api/video/generate-narration` と `/api/video/narration-audio` がAPIルートとして生成された。
- 開発サーバー上で `http://localhost:3000/video` が 200 で返ることを確認した。
- `/api/video/generate-narration` は空リクエストに対して 400 を返し、入力チェックが働くことを確認した。
- 実際のTTS音声生成は、Mac側でAPIキーと短い英訳原稿を用意した環境で確認する必要がある。

## 2026-06-02 英語版MP4書き出しの追加

### 作業内容
- `lib/video.ts` に、元動画の映像トラックと英語ナレーション音声トラックをffmpegで合成する処理を追加した。
- `app/api/video/render-english-video/route.ts` を追加し、`work/video-localization/<jobId>/english-version.mp4` として英語版MP4を書き出せるようにした。
- `app/api/video/rendered-video/route.ts` を追加し、保存済み英語版MP4をブラウザでプレビュー再生できるようにした。
- `/video` 画面に「英語版MP4を書き出し」ボタン、英語版MP4プレビュー、保存パス表示を追加した。
- docs/spec.md に、字幕なしの英語版MP4書き出しを実装済み範囲として追記した。

### 判断
- 初期MVPでは字幕なしで、元動画の映像と英語ナレーション音声のみを合成する。
- ffmpegでは `0:v:0` と `1:a:0` だけをmapし、元動画の日本語音声トラックをmapしないことで完全差し替えにする。
- 元の日本語MP4は保持し、英語版MP4は `english-version.mp4` として別ファイルにする。
- 次の実装単位は、英語字幕SRT生成、またはMac実機での短い検証MP4を使った一連の動作確認。

### 確認
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` と `.next/types` を参照できず失敗したため、ビルド後に通常権限で再実行した。
- `npm.cmd run build` 成功。`/api/video/render-english-video` と `/api/video/rendered-video` がAPIルートとして生成された。
- 開発サーバー上で `http://localhost:3000/video` が 200 で返ることを確認した。
- `/api/video/render-english-video` は空リクエストに対して 400 を返し、入力チェックが働くことを確認した。
- 実際の英語版MP4書き出しは、Mac側で `ffmpeg`、APIキー、短い検証MP4を用意した環境で確認する必要がある。

## 2026-06-02 Mac実機検証手順の追加

### 作業内容
- `docs/video-localization-mac-test.md` を追加し、Mac上で講演動画ローカライズMVPを検証する手順を整理した。
- ffmpegインストール、APIキー設定、開発サーバー起動、MP4選択、WAV抽出、全文文字起こし、全文英訳、標準TTSナレーション生成、英語版MP4書き出しまでの確認手順をまとめた。
- `ffprobe` で英語版MP4の音声トラックを確認する手順を追記した。
- docs/spec.md に、Mac実機検証手順書への参照を追記した。

### 判断
- 字幕や分割に進む前に、短い検証MP4で一連の流れをMac実機確認する。
- 検証では、元のKeynote MP4が上書きされないこと、英語版MP4に日本語音声が残っていないことを明確な成功条件にした。

### 確認
- ドキュメント追加のみ。コード変更なし、テスト実行なし。

## 2026-06-02 Windows実機検証手順の追加

### 作業内容
- `docs/video-localization-windows-test.md` を追加し、Macがない状態でもWindows上で講演動画ローカライズMVPを検証できる手順を整理した。
- Windowsでのffmpegインストール、PowerShellでの確認、APIキー設定、開発サーバー起動、`/video` 画面での通し確認をまとめた。
- `ffprobe` で英語版MP4の音声トラックを確認するWindows向けコマンドを追記した。
- docs/spec.md に、Windows実機検証手順書への参照を追記した。
- `lib/video.ts` に、WindowsでPATHにffmpegが反映されていない場合でも、`winget` の一般的な展開先から `ffmpeg.exe` / `ffprobe.exe` を探すフォールバックを追加した。
- ffmpeg未検出時のエラーメッセージを、MacだけでなくWindowsでも自然に読める表現へ変更した。

### 判断
- Mac向けソフトウェアとして設計しつつ、現時点のWebアプリMVPはWindowsでも確認できるようにする。
- Windows検証では、ffmpegのPATH反映のためPowerShellと開発サーバーを開き直す点を明示する。
- 検証では引き続き、元のKeynote MP4が上書きされないこと、英語版MP4に日本語音声が残っていないことを成功条件にする。

### 確認
- `winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements` でFFmpeg 8.1.1をWindows環境へインストールした。
- `npm.cmd test` 成功。3ファイル、8テストが成功。
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` を書けず失敗したため、通常権限で再実行した。
- `npm.cmd run build` 成功。
- 開発サーバーを起動し、`http://localhost:3000/video` が 200 で返ることを確認した。
- `http://localhost:3000/api/video/ffmpeg-check` が `ready:true` を返し、`ffmpeg` と `ffprobe` の実体パスを認識できることを確認した。
- 1秒の合成MP4を作成し、`/api/video/extract-audio` でWAV抽出できることを確認した。
- テスト用ナレーションWAVを作成し、`/api/video/render-english-video` で英語版MP4を書き出せることを確認した。
- `ffprobe` で英語版MP4にVideo stream 1本、Audio stream 1本だけがあることを確認した。
- 文字起こし、全文英訳、TTS生成の実API確認は、APIキーと実際の短い検証MP4を用意して行う。

## 2026-06-03 検証用サンプルMP4の作成

### 作業内容
- `work/samples/dental-localization-sample-ja.mp4` を作成した。
- 架空の歯科講演スライド3枚と、Windowsの日本語TTS `Microsoft Haruka Desktop` による日本語ナレーションを合成した。
- 確認用の日本語原稿を `work/samples/sample-transcript-ja.txt` として保存した。
- 患者情報、個人情報、実在クリニック名、会社機密を含まない検証専用素材にした。

### サンプル仕様
- 長さ: 約33.7秒
- 解像度: 1280x720
- 映像: H.264 / 25fps
- 音声: AAC / mono
- 内容: 上顎臼歯部インプラント埋入、骨幅6mm、骨高径10mm、初期固定35Ncmなどの架空講演

### 確認
- `ffprobe` でサンプルMP4の長さ、映像、音声を確認した。
- 開発サーバーを起動し、`http://localhost:3000/video` が 200 で返ることを確認した。
- `/api/video/extract-audio` にサンプルMP4を送信し、WAV抽出が成功することを確認した。
- 文字起こし、全文英訳、TTS生成の実API確認は次の作業で行う。

## 2026-06-05 サンプルMP4での通し確認と英語字幕SRT生成の追加

### 作業内容
- `work/samples/dental-localization-sample-ja.mp4` を使い、Geminiで音声抽出、全文文字起こし、全文英訳、英語ナレーション生成、英語版MP4書き出しまで通し確認した。
- PowerShellのJSONデコードで日本語保存結果が文字化けしたため、Node `fetch` で再実行し、UTF-8の文字起こし・英訳ファイルを `work/samples` に保存した。
- Windowsで `ffmpeg.exe` のPATH確認が待ちっぱなしになるケースを避けるため、`lib/video.ts` で `winget` の実体パス候補を先に使うようにした。
- `lib/subtitles.ts` を追加し、英訳原稿からSRT形式の英語字幕を生成できるようにした。
- `/api/video/generate-subtitles` と `/api/video/subtitles` を追加し、SRTを作業フォルダへ保存して取得できるようにした。
- `/video` 画面に「英語字幕SRT生成」ボタン、SRT表示、SRTファイルパス表示を追加した。
- SRT生成では、初期MVPとして英訳原稿を文単位で分割し、動画長に合わせてタイミングを割り当てる方式にした。
- 数値と単位が改行で分離しないよう、`6 mm` や `35 Ncm` をなるべく同じ字幕行に保持する処理を追加した。

### 判断
- 字幕の厳密な単語同期は後フェーズとし、まず配布パッケージ用の初期SRTを出力できることを優先する。
- SRTファイルも `work/video-localization/<jobId>` 配下だけに保存し、作業フォルダ外の任意パスを読ませない。
- 生成済み英訳を編集した場合は、古いSRT、ナレーション、英語版MP4をクリアする。

### 確認
- `npm.cmd test` 成功。4ファイル、11テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- `http://localhost:3001/api/video/ffmpeg-check` が `ready:true` を返すことを確認した。
- サンプルMP4で、`/api/video/extract-audio`、`/api/video/transcribe-audio`、`/api/translate`、`/api/video/generate-narration`、`/api/video/render-english-video` が成功した。
- 書き出した英語版MP4は `ffprobe` で映像1本・音声1本だけであることを確認した。
- サンプル英訳で `/api/video/generate-subtitles` が `english-subtitles.srt` を生成できることを確認した。

## 2026-06-05 配布用パッケージ作成の追加

### 作業内容
- `lib/video.ts` に、動画ローカライズ作業フォルダ内へ配布用 `package` フォルダを作る処理を追加した。
- `/api/video/create-package` を追加し、英語版MP4、英語字幕SRT、日本語文字起こし、英訳原稿、要確認リスト、README、manifestをまとめられるようにした。
- `/video` 画面に「配布用パッケージ作成」ボタンと、生成されたファイル一覧の表示を追加した。
- 配布用パッケージには元の日本語MP4を含めず、`manifest.json` に `includesOriginalJapaneseVideo: false` を明記するようにした。

### 判断
- 初期MVPではZIP化せず、まずOSに依存しにくいフォルダ形式で出力する。
- 元の日本語MP4は作業用コピーとして保持するが、配布用パッケージには入れない。
- 要確認リストは固定Markdownとして出力し、数値、単位、左右、上下顎、禁忌、適応、字幕タイミング、元日本語音声の残存確認を人が確認できるようにする。

### 確認
- `npm.cmd test` 成功。4ファイル、11テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- サンプルジョブ `ee803dff-f52a-456e-8a1c-d26cbb43458a` で `/api/video/create-package` が成功した。
- `work/video-localization/ee803dff-f52a-456e-8a1c-d26cbb43458a/package` に、`english-version.mp4`、`english-subtitles.srt`、`japanese-transcript.txt`、`english-script.txt`、`review-checklist.md`、`README.md`、`manifest.json` が作成されることを確認した。

## 2026-06-05 配布用パッケージZIPダウンロードの追加

### 作業内容
- `lib/zip.ts` を追加し、外部依存を増やさずに配布用ファイルをZIPへまとめられるようにした。
- `/api/video/package-zip` を追加し、作成済み `package` フォルダをZIPとしてダウンロードできるようにした。
- `/video` 画面の配布用パッケージ欄に「ZIPをダウンロード」リンクを追加した。

### 判断
- 初期MVPのZIPは圧縮なしの標準ZIPとする。MP4は圧縮しても容量がほぼ減らないため、速度と安定性を優先する。
- ZIPには既知の配布ファイルだけを入れ、元の日本語MP4や作業用WAVなどは含めない。
- 大容量対応のストリーミングZIPは後フェーズとし、まず短い検証動画の配布パッケージを確実に扱えるようにする。

### 確認
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- サンプルパッケージに対して `/api/video/package-zip` を実行し、`downloaded-package-test.zip` を保存できることを確認した。
- `Expand-Archive` でZIPを展開し、`english-version.mp4`、`english-subtitles.srt`、`japanese-transcript.txt`、`english-script.txt`、`review-checklist.md`、`README.md`、`manifest.json` が含まれることを確認した。

## 2026-06-05 字幕焼き込み版MP4と配布形式選択の追加

### 作業内容
- `lib/video.ts` に、英語版MP4へ英語字幕SRTを焼き込む `renderSubtitledVideo` を追加した。
- `/api/video/render-subtitled-video` を追加し、`english-version-subtitled.mp4` を作成できるようにした。
- `/video` 画面に「字幕焼き込みMP4作成」ボタン、字幕焼き込み版MP4プレビュー、配布形式選択を追加した。
- 配布形式は、SRT同梱版と字幕焼き込み版から選べるようにした。
- 字幕焼き込み版を選んだ場合、配布用パッケージには焼き込み済みMP4を `english-version.mp4` として入れ、SRTは同梱しないようにした。
- 配布パッケージ作成前に既知ファイルを削除し、前回作成したSRTなどが別モードのパッケージに残らないようにした。

### 判断
- SRT同梱版は、字幕を後から修正・差し替えやすい配布形式として残す。
- 字幕焼き込み版は、SRTを読み込めない再生環境向けに追加する。
- 初期MVPでは字幕焼き込みの細かなフォント設定は行わず、FFmpegの標準 `subtitles` フィルタで確実に焼き込む。

### 確認
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- サンプルジョブ `ee803dff-f52a-456e-8a1c-d26cbb43458a` で `/api/video/render-subtitled-video` が成功し、`english-version-subtitled.mp4` が作成されることを確認した。
- `ffprobe` で字幕焼き込み版MP4に映像1本・音声1本があることを確認した。
- 焼き込み版を選んだ配布パッケージとZIPを作成し、ZIP展開後に `english-subtitles.srt` が含まれず、焼き込み版MP4が `english-version.mp4` として含まれることを確認した。

## 2026-06-17 英語音声取得から日本語メモ保存までの準備

### 作業内容
- `/api/transcribe` に `sourceLanguage` を追加し、既存の日本語音声に加えて英語音声の文字起こしに対応した。
- `lib/transcription.ts` に汎用 `transcribeAudio` を追加し、既存の `transcribeJapaneseAudio` は動画ローカライズ互換のため残した。
- `/api/translate-to-japanese` を追加し、英語文字起こしを日本語メモへ翻訳できるようにした。
- メイン画面に「英語→日本語メモ」パネルを追加した。
- 英語録音開始、英語録音停止、英語文字起こし、日本語化、端末内保存、TXTダウンロードを行えるUIを追加した。
- 英語→日本語メモ履歴はlocalStorageに最大50件保存するようにした。
- `docs/spec.md` に英語入力ラインとPhase 5準備実装を追記した。

### 判断
- 今回は完全な同時通訳ではなく、短時間録音単位の疑似リアルタイム化の土台として実装した。
- 既存の日本語→英語/中国語翻訳は壊さないため、英語→日本語は専用APIと専用UIに分けた。
- サーバー側には英語原文や日本語メモを保存せず、端末内localStorageとTXTダウンロードに限定した。
- 患者情報、実在医院名、会社非公開情報を入力しない運用前提は既存方針を維持する。

### 確認
- `npm.cmd run typecheck` に成功した。初回はサンドボックス制限で `tsconfig.tsbuildinfo` を書けず失敗したため、許可付きで再実行した。
- `npm.cmd test` に成功した。5ファイル、12テストが成功。
- `npm.cmd run build` に成功した。`/api/translate-to-japanese` がAPIルートとして生成された。
- 開発サーバーを起動し、`http://localhost:3000/` が HTTP 200 を返すことを確認した。
- `/api/translate-to-japanese` は空リクエストに対して 400 と「日本語化する英語テキストがありません。」を返すことを確認した。
- `/api/transcribe` は英語指定の正しいmultipartで音声ファイルなしの場合、400 と「音声ファイルが見つかりません。」を返すことを確認した。

## 2026-06-18 続き作業の確認と入力エラー処理の整理

### 作業内容
- 2026-06-17時点の英語音声取得から日本語メモ保存までの実装を引き継ぎ、未コミット差分の状態を確認した。
- `npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run build` が通ることを確認した。
- 開発サーバーを起動し、`http://localhost:3000/`、`http://localhost:3000/video`、`/api/health` が 200 を返すことを確認した。
- `/api/translate-to-japanese` の空入力が 400 と「日本語化する英語テキストがありません。」を返すことを確認した。
- `/api/transcribe` に Content-Type なしのPOSTが来た場合、サーバー例外の500ではなく、400 と「音声ファイルが見つかりません。」を返すようにした。
- `/api/video/ffmpeg-check` が `ready:true` を返し、Windows環境の ffmpeg / ffprobe を検出できることを確認した。

### 判断
- 通常UIからの文字起こしリクエストは multipart だが、API直叩きや異常リクエストでもユーザー向けに自然な400を返す方が安全と判断した。
- 今回は入力エラー処理の小修正に留め、英語→日本語メモUIや動画ローカライズの仕様は変更していない。

### 確認
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run typecheck` 成功。
- `npm.cmd run build` 成功。
- `curl.exe -X POST http://localhost:3000/api/transcribe` が 400 と「音声ファイルが見つかりません。」を返すことを確認した。

## 2026-06-18 疑似リアルタイム英語→日本語メモの追加

### 作業内容
- メイン画面の「英語→日本語メモ」パネルに「連続メモ」を追加した。
- 連続メモでは、15秒 / 30秒 / 60秒の区切り時間を選べるようにした。初期値は30秒。
- 録音中に一定秒数ごとの音声チャンクを切り出し、英語文字起こし、英語→日本語メモ化を順番に処理するようにした。
- 区切りごとの状態として、待機中、文字起こし中、日本語化中、完了、要再実行を表示するようにした。
- 完了した区切りは、英語原文と日本語メモとして表示し、通常の英語→日本語メモ履歴にも保存するようにした。
- 失敗した区切りは、録音セッション中に保持している音声データから再実行できるようにした。
- 連続メモの結果を、区切りごとの英語原文と日本語メモを含むTXTとしてダウンロードできるようにした。
- `docs/spec.md` に連続メモの仕様を追記した。

### 判断
- 完全な同時通訳ではなく、短い区切りごとに少し遅れて日本語メモを積み上げる疑似リアルタイム方式とした。
- APIリクエストを並列に投げすぎないよう、区切りごとの処理はキューで1件ずつ実行する方針にした。
- 既存の単発英語録音、日本語化、履歴保存、TXTダウンロードは維持し、その横に連続メモを追加した。
- 音声データはサーバー保存せず、再実行用の音声片も現在のブラウザセッション中のメモリにのみ保持する。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run build` 成功。
- 開発サーバーを再起動し、`http://localhost:3000/` が 200 を返すことを確認した。
- トップページHTMLに「連続メモ」「15秒 / 30秒 / 60秒」「まとめTXT」が表示されることを確認した。

## 2026-06-18 連続メモの手動区切り追加

### 作業内容
- 連続メモ録音中に使う「ここで区切る」ボタンを追加した。
- 手動区切りでは、現在までに録音された未処理チャンクを1つの区切りとしてキューへ追加するようにした。
- 手動区切り後に自動区切りタイマーをリセットし、直後に短すぎる自動区切りが発生しにくいようにした。
- 区切れる音声がまだない場合は、400系APIへ送らず、画面上に「少し話してから区切ってください」と表示するようにした。
- `docs/spec.md` に手動区切りの仕様を追記した。

### 判断
- Q&Aや話題の切れ目では固定秒数より手動区切りの方が自然なため、自動区切りとの併用方式にした。
- 手動区切りはサーバー保存を行わず、既存の連続メモキューと同じ英語文字起こし・日本語化処理に流す。

### 確認
- `npm.cmd run typecheck` 成功。
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run build` 成功。

## 2026-06-20 外部マイク選択と入力レベル表示

### 作業内容
- メイン画面の設定エリアに「入力マイク」選択欄を追加した。
- `navigator.mediaDevices.enumerateDevices()` でブラウザが認識しているマイク一覧を取得し、DJI Mic Miniなどの外部マイクを選べるようにした。
- 録音開始時に選択中の `deviceId` を `getUserMedia` に渡すようにした。
- デバイス変更時の自動更新と、手動の「再読み込み」ボタンを追加した。
- 録音中に入力レベルメーターを表示し、peak / RMS の簡易値を確認できるようにした。
- 連続メモ録音中のステータス文言を「連続メモ録音中」として区別できるようにした。
- `docs/spec.md` に入力マイク選択と入力レベル表示の仕様を追記した。

### 判断
- DJI Mic MiniがOSやブラウザで認識されていても、アプリが別の既定マイクを使う可能性があるため、アプリ内で入力デバイスを明示選択できるようにした。
- 音声が届いているかを録音後の無音判定だけで判断すると原因切り分けが遅いため、録音中に入力レベルを表示する方針にした。
- 音声データやマイク名はサーバー保存せず、ブラウザ内の録音処理と表示に限定した。

### 確認
- `npm.cmd run typecheck` 成功。初回はサンドボックス制限で `tsconfig.tsbuildinfo` を書けず失敗したため、通常権限で再実行した。
- `npm.cmd test` 成功。5ファイル、12テストが成功。
- `npm.cmd run build` 成功。

## 2026-06-20 日本語録音中プレビューの追加

### 作業内容
- 日本語録音中に5秒ごとへ音声を区切り、録音停止前に文字起こしプレビューへ追加する処理を追加した。
- 録音中プレビュー欄を日本語録音ボタンの下に追加し、取得済みの文字起こしを入力欄風に表示するようにした。
- 各区切りに、待機中、文字起こし中、取得済み、エラーの状態を持たせた。
- 無音または短すぎる区切りはAPIへ送らず、録音停止時に残り区切りも処理するようにした。
- 録音中プレビューで文字起こしが取れた場合は、停止時に取得済みテキストを日本語原稿欄へまとめ、そのまま翻訳へ進めるようにした。
- プレビューで文字起こしが取れなかった場合は、従来どおり録音全体の文字起こしへフォールバックするようにした。
- `docs/spec.md` に録音中プレビュー仕様を追記した。

### 判断
- ユーザーが録音停止前に「内容が文字として取れているか」を確認できるよう、完全リアルタイムではなく5秒区切りの疑似リアルタイム方式にした。
- API送信回数は増えるが、音声入力の切り分けを優先し、無音区切りは送らないことで無駄な送信を抑える。
- 音声区切りと文字起こしプレビューはブラウザ内の一時状態に限定し、サーバー保存は行わない。

### 確認
- `npm.cmd run typecheck` 成功。

## 2026-08-27 未コミット・未push整理

### 作業内容
- `main` から `docs/update-dev-log` を作成し、録音中プレビューの確認記録を正しい朝礼節へ移した既存のdev-log差分を監査した。
- 既存の未pushコミット1件を同ブランチへ引き継いだ。
- コード、依存関係、環境変数、API設定、実データは変更していない。

### 確認方法
- Codex実行: `npm.cmd test` はVitest 5ファイル・12テストすべて成功、exit 0。
- `git diff --check`: 空白エラーなし（既存設定によるLFからCRLFへの変換予告のみ）。

## 2026-08-27 朝礼反映

### 現在の状態
- 日本語録音中プレビューの実装・確認履歴を、12テスト成功の状態でGitHubレビューへ出せる。

### 完了
- 済: 録音中プレビューの確認結果を正しい朝礼節へ整理し、既存の未pushコミットとともにGitへまとめた。（CodexでVitest 5ファイル・12テストと差分健全性を確認）

### 次のアクション
- 録音中プレビューの遅延を実機で確認し、必要に応じて処理間隔と表示を調整する。

### 条件付き・保留
- Web Speech API／Realtime API／Live APIの比較と、Q&A向け区切り操作の改善。

### 承認・確認待ち
- 作成したPRのレビューとマージ。

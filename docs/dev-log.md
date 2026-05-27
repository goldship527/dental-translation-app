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

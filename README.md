# dental-translation-app

歯科医院で使う短い定型文を、外国語で案内するためのWebプロトタイプです。

## 現在の状態

- 静的HTML/CSS/JavaScriptのデモ版
- 実翻訳APIは未接続
- 患者情報や個人情報は保存しない前提

## 使い方

`src/index.html` をブラウザで開きます。

ローカルサーバーで確認する場合:

```powershell
cd C:\Dev\dental-translation-app
node src/server.mjs
```

その後、ブラウザで `http://localhost:8000` を開きます。

## スマホで見る

PCとスマホを同じWi-Fiに接続します。

サーバー起動時に表示される `Phone on same Wi-Fi: http://...:8000` のURLを、スマホのブラウザで開きます。

例:

```text
http://192.168.40.252:8000
```

開けない場合は、WindowsファイアウォールがNode.jsの通信を止めている可能性があります。

## 外出先のスマホで見る

外出先やモバイル回線のスマホで見るには、GitHub Pagesなどにデプロイします。

このプロジェクトは静的HTML/CSS/JavaScriptなので、GitHub Pagesでは `main` ブランチのルートを公開対象にします。ルートの `index.html` から `src/` のアプリ画面へ移動します。

手順:

1. GitHubに `dental-translation-app` リポジトリを作成する
2. このフォルダをGitHubへpushする
3. GitHubの `Settings` → `Pages` を開く
4. `Source` を `Deploy from a branch` にする
5. `Branch` を `main`、フォルダを `/root` にして保存する
6. 表示された `https://...github.io/dental-translation-app/` をスマホで開く

## フォルダ構成

- `docs/`: 仕様書・開発ログ
- `src/`: Webプロトタイプ
- `tests/`: テスト
- `AGENTS.md`: Codex用プロジェクト指示
- `CLAUDE.md`: Claude Code用プロジェクト指示

# Dental Lecture Translator

歯科講演・教育・質疑応答向けのスマホファーストPWAです。日本語音声を文字起こしし、英語・簡体中国語に翻訳して表示します。

## セットアップ

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local` に利用したいAPIキーを設定してください。画面上の「API」選択で Gemini / OpenAI を切り替えられます。

## API設定

Geminiを使う場合:

```env
GEMINI_API_KEY=...
GEMINI_AUDIO_MODEL=gemini-2.5-flash
GEMINI_TRANSLATION_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
```

OpenAIを使う場合:

```env
OPENAI_API_KEY=sk-...
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TRANSLATION_MODEL=gpt-4.1-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
```

APIキーは Next.js のサーバールートだけで使用し、ブラウザには公開しません。

## デプロイ

このアプリは Next.js のAPIルートを使うため、GitHub Pagesでは動きません。
外出先のスマホで使う場合は、VercelなどNext.js対応ホスティングへデプロイします。

Vercelで公開する場合:

1. GitHubリポジトリをVercelにImportする
2. Framework Presetは `Next.js`
3. 必要な環境変数をVercelのProject Settingsに設定する
   - `GEMINI_API_KEY`
   - `GEMINI_AUDIO_MODEL`
   - `GEMINI_TRANSLATION_MODEL`
   - `GEMINI_TTS_MODEL`
   - `OPENAI_API_KEY`
   - `OPENAI_TRANSCRIBE_MODEL`
   - `OPENAI_TRANSLATION_MODEL`
   - `OPENAI_TTS_MODEL`
4. Deployする

GeminiまたはOpenAIのどちらか一方だけでも動作します。使わないAPIのキーは未設定で構いません。

## MVP範囲

- ブラウザのマイク録音
- Gemini API / OpenAI API の切り替え
- 日本語音声の文字起こし
- 英語・簡体中国語翻訳
- 英語・簡体中国語の手動読み上げ
- 音声タイプ選択
- 読み上げ速度選択
- 講演 / Q&A / 原稿モード
- 翻訳スタイル選択
- コピー操作
- `/data/dental-glossary.json` の外部辞書読み込み
- `risk: true` の辞書語、数値、mm、Ncm、左右、上下顎、禁忌、適応の要確認表示
- PWA manifest と Service Worker

## 注意

本アプリの翻訳結果は、歯科講演・教育・コミュニケーション補助を目的としたものです。医療判断、診断、治療方針の決定を目的としたものではありません。専門用語、数値、術式、禁忌、適応に関する内容は、必ず使用者が確認してください。

読み上げ音声はAIにより生成された音声です。

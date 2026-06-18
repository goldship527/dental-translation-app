# 講演動画ローカライズ Windows実機検証手順

## 目的

Macが手元にない状態でも、Windows上で短い日本語講演MP4を使い、以下の流れが通るか確認する。

```text
MP4選択
↓
WAV音声抽出
↓
日本語全文文字起こし
↓
全文英訳
↓
標準TTS英語ナレーション生成
↓
日本語音声を完全差し替えた英語版MP4書き出し
```

## 前提

- 最初は1GB以下、できれば30秒から2分程度の短い検証MP4を使う。
- 元の日本語MP4は上書きしない。
- 英語版MP4は作業フォルダ内に別ファイルとして作成する。
- 初期MVPでは字幕なし。映像は元動画、音声は英語ナレーションのみ。
- 患者情報、個人情報、非公開の症例情報、会社機密を含む動画は検証に使わない。
- ここではPowerShellで確認する。

## Windows側の準備

### 1. ffmpegをインストール

PowerShellを開き、以下を実行する。

```powershell
winget install Gyan.FFmpeg
```

インストール後、PowerShellを開き直して確認する。

```powershell
ffmpeg -version
ffprobe -version
```

どちらもバージョンが表示されればOK。

`ffmpeg` が見つからない場合は、Windowsを再起動するか、PATHが反映された新しいPowerShellで再確認する。

アプリ側では、PATHに反映されていない場合でも、`winget` の一般的な展開先にある `ffmpeg.exe` / `ffprobe.exe` を探す。ただし、通常はPowerShellを開き直してPATHを反映させるのが分かりやすい。

### 2. 依存関係を入れる

```powershell
cd C:\Dev\dental-translation-app
npm.cmd install
```

すでに依存関係が入っている場合は、この手順は短時間で終わる。

### 3. APIキーを設定

`.env.example` を参考に `.env.local` を作る。

Geminiだけ、またはOpenAIだけでも検証できる。

```env
GEMINI_API_KEY=...
GEMINI_AUDIO_MODEL=gemini-2.5-flash
GEMINI_TRANSLATION_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
```

または:

```env
OPENAI_API_KEY=sk-...
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TRANSLATION_MODEL=gpt-4.1-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
```

APIキーはGitに入れない。`.env.local` はローカル専用にする。

### 4. 開発サーバーを起動

```powershell
npm.cmd run dev
```

ブラウザで開く:

```text
http://localhost:3000/video
```

すでに別プロセスが3000番ポートを使っている場合は、ターミナル表示に出た別ポートのURLを開く。

## 検証手順

### 1. ffmpeg状態を確認

`/video` 画面の `ffmpeg` 欄が「利用できます」になっているか確認する。

利用できない場合:

- `winget install Gyan.FFmpeg` が済んでいるか確認する
- PowerShellを開き直してから `npm.cmd run dev` を再起動する
- `ffmpeg -version` と `ffprobe -version` が通るか確認する

### 2. MP4を選択

`Keynote録画MP4を選択` から検証MP4を選ぶ。

確認する項目:

- ファイル名
- 容量
- 長さ
- 解像度
- ブラウザ内プレビュー再生

### 3. 音声を抽出

`音声を抽出` を押す。

成功すると以下が表示される。

- 元動画コピー
- 抽出音声

作業フォルダ例:

```text
work\video-localization\<jobId>\
```

確認ポイント:

- 元のKeynote MP4は上書きされていない
- 作業フォルダにMP4コピーとWAVがある

### 4. 日本語全文を文字起こし

`文字起こしAPI` で Gemini または OpenAI を選ぶ。

`全文を文字起こし` を押す。

確認ポイント:

- 日本語文字起こし欄に全文が表示される
- 歯科用語、数値、単位、製品名が大きく崩れていない
- 誤認識があれば、この欄で修正する

### 5. 全文を英訳

`全文を英訳` を押す。

確認ポイント:

- 英訳原稿欄に英文が表示される
- 歯科用語、数値、単位、左右、上下顎、術式名が保持されている
- 講演用として不自然な英語があれば、この欄で修正する

### 6. 英語ナレーションを生成

`英語ナレーション生成` を押す。

確認ポイント:

- 英語ナレーション欄に音声プレイヤーが表示される
- 音声が再生できる
- 英訳原稿の内容を読んでいる
- 長すぎる原稿でエラーが出た場合は、短い動画で再試行する

### 7. 英語版MP4を書き出し

`英語版MP4を書き出し` を押す。

確認ポイント:

- 英語版MP4欄に動画プレイヤーが表示される
- 映像は元動画と同じ
- 音声は英語ナレーションのみ
- 元の日本語音声が聞こえない

## ffprobeでの確認

作業フォルダの英語版MP4に対して、音声トラック数を確認する。

```powershell
ffprobe -hide_banner -i work\video-localization\<jobId>\english-version.mp4
```

期待:

- Video stream がある
- Audio stream が1つある
- 元動画の日本語音声が複数トラックとして残っていない

## 成功条件

- `/video` 画面でffmpegが利用可能と表示される
- MP4からWAVを抽出できる
- 日本語全文文字起こしが表示される
- 全文英訳が表示される
- 英語ナレーション音声を生成・再生できる
- 英語版MP4を書き出して再生できる
- 元の日本語音声が英語版MP4に残っていない
- 元のKeynote MP4が上書きされていない

## よくある失敗

### ffmpegが利用できない

```powershell
winget install Gyan.FFmpeg
```

その後、PowerShellを開き直し、`npm.cmd run dev` を再起動する。

### ffprobeは通るが画面では利用不可になる

開発サーバーを起動したPowerShellが古いPATHを持っている可能性がある。

PowerShellを閉じ、新しく開いてから以下を実行する。

```powershell
cd C:\Dev\dental-translation-app
npm.cmd run dev
```

### APIキー未設定

`.env.local` にGeminiまたはOpenAIのAPIキーを設定し、`npm.cmd run dev` を再起動する。

### TTSで長すぎると言われる

初期MVPでは4096文字以内の英訳原稿を対象にする。短い検証動画で試す。

### 日本語音声が英語版に残っている気がする

まず動画プレイヤーで確認する。必要なら `ffprobe` で音声トラック数を確認する。

現在の実装では、ffmpeg合成時に元動画の音声トラックをmapしないため、英語版MP4には英語ナレーション音声だけが入る想定。

# Dental Lecture Translator 仕様書

最終更新: 2026-05-12

## 1. アプリ概要

Dental Lecture Translator は、日本語の音声または日本語原稿を入力し、日本語原文、英語翻訳、簡体中国語翻訳を表示する歯科講演向け翻訳補助PWAである。

主な用途は、日本人歯科医師、歯科企業講師、インプラント関連製品担当者、海外学会・セミナー登壇者、海外ドクターと会話する日本人スタッフの翻訳補助である。

本アプリは医療判断、診断、治療方針決定を目的としない。専門用語、数値、術式、禁忌、適応、左右、上下顎などは必ず使用者が確認できるUIにする。

## 2. 現在の実装範囲

現在はMVPとして以下を実装済み。

- スマホファーストUI
- PWA manifest / Service Worker
- Gemini / OpenAI API切り替え
- ブラウザマイク録音
- 録音音声のWAV化
- 日本語音声の文字起こし
- 日本語原稿入力からの翻訳
- 英語翻訳
- 簡体中国語翻訳
- 各テキストのコピー
- 講演モード / Q&Aモード / 原稿モード
- 翻訳スタイル選択
- 翻訳履歴の保存・復元
- 外部JSON歯科用語辞書読み込み
- インプラント関連用語、主要歯科メーカー名、主要インプラントシステム名、表面性状、接続様式の標準用語集登録
- `risk: true` 用語、数値、mm、Ncm、左右、上下顎、禁忌、適応の要確認表示
- 無音録音の誤認識対策
- APIエラーの日本語表示
- 英語・簡体中国語の手動読み上げ
- 音声タイプ選択
- 読み上げ速度選択

## 3. 技術構成

- フロントエンド: Next.js, React, TypeScript
- UI: CSS Modulesではなく `app/globals.css` によるグローバルCSS
- アイコン: lucide-react
- PWA: `public/manifest.json`, `public/sw.js`
- 音声録音: Browser MediaDevices API + Web Audio API
- 音声形式: ブラウザ側で `audio/wav` に変換
- AI API:
  - Gemini: `@google/genai`
  - OpenAI: `openai`
- 保存:
  - 最新翻訳結果をlocalStorageへ保存
  - 直近20件の翻訳履歴をlocalStorageへ保存
  - 将来的にはお気に入りで拡張予定

## 4. 環境変数

`.env.local` に利用するAPIキーを設定する。

```env
# Gemini
GEMINI_API_KEY=...
GEMINI_AUDIO_MODEL=gemini-2.5-flash
GEMINI_TRANSLATION_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_TRANSLATION_MODEL=gpt-4.1-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
```

どちらか一方だけでも動作する。画面上部のAPIセレクトで Gemini / OpenAI を切り替える。

## 5. 画面構成

メイン画面は以下の縦並び構成。

- ヘッダー
  - アプリ名
  - ステータス表示: 準備完了 / マイク確認中 / 録音中
- 設定エリア
  - API選択: Gemini / OpenAI
  - モード選択
  - 翻訳スタイル選択
- 録音・入力エリア
  - 録音開始
  - 録音停止
  - 日本語原稿入力 textarea
  - 翻訳するボタン
- 結果表示
  - 日本語原文
  - English
  - 简体中文
- 読み上げ
  - English 再生 / 停止
  - 简体中文 再生 / 停止
  - 音声タイプ
  - 読み上げ速度
- 要確認ポイント
- 翻訳履歴
- 注意文言

## 6. モード仕様

### 講演モード

海外講演、学会発表、セミナー説明向け。

- 長めの日本語を自然な講演文に整える
- 歯科専門家向けの表現を使う
- 口語すぎる表現を避ける
- 教育調、講演調を優先する
- 専門用語、数値、術式、製品名は保持する

### Q&Aモード

質疑応答やその場の会話向け。

- 短く簡潔
- 口頭で返しやすい
- 専門用語は崩さない
- 回答として使いやすい文体にする

### 原稿モード

事前準備用。

- 日本語原稿を貼り付けて翻訳
- スライド原稿や講演前準備を想定
- 将来的にスライド番号、テンプレート、修正版保存へ拡張する

## 7. 翻訳スタイル

選択肢:

- 専門家向け・講演調
- 丁寧なビジネス調
- 短く簡潔
- 患者説明向け
- ハンズオン指導向け

初期値は「専門家向け・講演調」。

## 8. API切り替え仕様

### Gemini

使用箇所:

- 音声文字起こし
- 英語・簡体中国語翻訳

特徴:

- 音声はWAVとしてinline dataで送信
- 翻訳はJSON structured outputを指定
- `503 high demand` が出ることがあるため、一度だけ短い自動リトライを行う

### OpenAI

使用箇所:

- 音声文字起こし
- 英語・簡体中国語翻訳

特徴:

- 音声文字起こしは Speech-to-Text API
- 翻訳は Responses API + JSON schema
- 課金上限、利用上限、APIキーエラーを日本語表示する

## 8.1 音声出力仕様

英語翻訳と簡体中国語翻訳に対して、手動の読み上げ機能を提供する。

実装済み機能:

- Englishカードの再生 / 停止
- 简体中文カードの再生 / 停止
- 音声タイプ選択
  - Standard
  - Calm
  - Lecture
- 読み上げ速度
  - 0.8x
  - 1.0x
  - 1.2x
- 同じテキスト、API、言語、音声タイプ、速度の組み合わせはブラウザ側で音声URLをキャッシュする
- 翻訳完了後の自動読み上げは行わない

OpenAI TTS:

- `OPENAI_TTS_MODEL` を使用
- 既定値は `gpt-4o-mini-tts`
- 音声形式は `mp3`
- speedパラメータを使用

Gemini TTS:

- `GEMINI_TTS_MODEL` を使用
- 既定値は `gemini-3.1-flash-tts-preview`
- Gemini TTSはPreview扱い
- 返却されたPCM音声をサーバー側でWAVにラップしてブラウザ再生する

注意:

- 読み上げ音声はAIにより生成された音声であることをUI上の注意文言に明記する
- 講演中の事故防止のため、現段階では自動再生は実装しない

## 9. 音声録音仕様

録音は `navigator.mediaDevices.getUserMedia` と Web Audio API で行う。

処理フロー:

1. 録音開始ボタン押下
2. `マイク確認中` を表示
3. マイク権限を確認
4. 録音中表示へ切り替え
5. 音声をFloat32Arrayとして蓄積
6. 録音停止時にWAVへ変換
7. 無音判定
8. APIへ送信

## 10. 無音・誤認識対策

何も話していない録音をAI APIへ送ると、モデルがそれらしい講演文を補完することがある。そのため、クライアント側で以下を判定する。

- 録音時間
- ピーク音量
- RMS音量
- 発話らしい音の割合

閾値は環境変数で調整できる。未設定時は以下の既定値を使う。

```env
NEXT_PUBLIC_SILENCE_MIN_DURATION=0.6
NEXT_PUBLIC_SILENCE_PEAK=0.025
NEXT_PUBLIC_SILENCE_RMS=0.006
NEXT_PUBLIC_SILENCE_SPEECH_RATIO=0.01
```

スマホブラウザ側で参照するため、変数名には `NEXT_PUBLIC_` プレフィックスを付ける。

無音または短すぎる録音の場合はAPIへ送信せず、以下を表示する。

```text
音声が検出されませんでした。録音開始後に少し話してから停止してください。
```

APIプロンプト側にも、無音・ノイズのみの場合は空文字を返し、内容を作らないよう指示する。

## 11. 要確認ポイント仕様

以下を要確認として表示する。

- 辞書JSONで `risk: true` の用語
- 数値
- `mm`
- `Ncm`
- 右側
- 左側
- 上顎
- 下顎
- 前歯部
- 臼歯部
- 即時埋入
- 即時荷重
- 即時機能
- 禁忌
- 適応

表示例:

```text
上顎
maxilla / 上颌

35 Ncm
35 Ncm / 35 Ncm
```

## 12. 歯科用語辞書

辞書はコード内に固定せず、外部JSONとして管理する。

ファイル:

```text
public/data/dental-glossary.json
```

形式:

```json
{
  "id": "implant_001",
  "ja": "インプラント",
  "en": "dental implant",
  "zh": "牙种植体",
  "category": "implant",
  "risk": false,
  "note": "文脈によりimplantでも可"
}
```

拡張方針:

- JSON追加だけで用語拡張可能
- `category` で分類
- 主なカテゴリーは `implant`, `surgery`, `bone`, `sinus`, `soft`, `prosthetics`, `occlusion`, `anatomy`, `complication`, `maintenance`, `digital`, `manufacturer`, `implant_system`, `implant_surface`, `connection`
- メーカー名・製品システム名は原則として翻訳せず、固有名詞を保持する
- `risk: true` を要確認表示対象にする
- `note` で翻訳注意を管理
- 将来的に管理画面を追加可能な構造にする

## 12.1 翻訳履歴

翻訳が成功した結果は、端末内のlocalStorageに直近20件まで保存する。

保存対象:

- 日本語原文
- 英語翻訳
- 簡体中国語翻訳
- APIプロバイダ
- モード
- 翻訳スタイル
- 保存日時

履歴UIでは、保存日時、API、モード、日本語原文、英語訳の概要を表示する。

操作:

- 履歴から翻訳結果を復元する
- 履歴を1件削除する
- 履歴を全削除する

注意:

- 履歴は端末内保存のみで、別端末とは同期しない。
- 患者情報、個人情報、医院名、会社の非公開情報を入力しない運用を前提にする。

## 13. エラー表示

代表的なエラー:

- マイク拒否
  - マイクの使用が許可されていない旨を表示
- マイク未接続
  - 入力デバイス確認を促す
- APIキー未設定
  - Gemini / OpenAI の該当キー名を表示
- 課金・利用上限
  - APIキー、課金、利用上限確認を促す
- Gemini 503 high demand
  - 一時混雑として表示し、API切り替えも案内
- 無音
  - 音声未検出として表示

## 14. 現在の主要ファイル

- `app/page.tsx`
  - メインUI、録音、WAV変換、無音判定
- `app/api/transcribe/route.ts`
  - Gemini / OpenAI 文字起こし切り替え
- `app/api/translate/route.ts`
  - Gemini / OpenAI 翻訳切り替え
- `lib/prompts.ts`
  - 翻訳プロンプト生成
- `lib/risk.ts`
  - 要確認ポイント抽出
- `lib/gemini.ts`
  - Geminiクライアント生成
- `lib/openai.ts`
  - OpenAIクライアント生成
- `lib/api-errors.ts`
  - APIエラーの日本語化
- `public/data/dental-glossary.json`
  - 歯科用語辞書

## 15. リアルタイム化方針

完全リアルタイムAPIへ進む前に、まずは疑似リアルタイムを実装する方針が望ましい。

推奨フロー:

```text
録音しっぱなし
↓
1〜2秒ごとに音声を区切る
↓
日本語文字起こしを順次更新
↓
文末・無音・一定文字数で翻訳
↓
英語/中国語を追いかけて更新
```

UI方針:

- 日本語原文
  - ライブ下書き
  - 確定文
- 英語/中国語
  - 翻訳中表示
  - 確定翻訳
- 要確認ポイント
  - 数値、左右、上下顎などを即時抽出

課金対策:

- 無音時は送信しない
- 音声を短く区切りすぎない
- 翻訳は毎秒ではなく文節ごとに実行
- 途中翻訳リクエストはキャンセルまたは破棄
- 講演モードは正確性優先
- Q&Aモードは低遅延優先

将来的な選択肢:

- OpenAI Realtime API
- Gemini Live API

## 16. 今後の開発Phase

### Phase 1: MVP安定化

- 無音・ノイズ対策の閾値調整
- マイク権限UIの改善
- API切り替え時の状態表示改善
- スマホ実機検証

### Phase 2: 読み上げ

- 英語翻訳の読み上げ
- 中国語翻訳の読み上げ
- 読み上げ速度変更
- 音声タイプ選択
- provider別TTS切り替え

### Phase 3: 講演補助

- 翻訳履歴
- お気に入り
- 歯科用語辞書の拡充
- 原稿モードのスライド番号管理
- テンプレート登録
- 講演前修正版保存

### Phase 4: ライブ翻訳

- 疑似リアルタイム翻訳
- ライブ下書き/確定文UI
- Q&A向け低遅延モード
- Realtime API / Live API比較検証

## 17. 注意文言

本アプリの翻訳結果は、歯科講演・教育・コミュニケーション補助を目的としたものです。医療判断、診断、治療方針の決定を目的としたものではありません。専門用語、数値、術式、禁忌、適応に関する内容は、必ず使用者が確認してください。

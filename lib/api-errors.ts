type ApiErrorLike = {
  status?: number;
  code?: string | number;
  message?: string;
};

export function formatApiError(error: unknown, fallback: string) {
  if (!isErrorLike(error)) return fallback;

  const message = error.message ?? "";
  const lowerMessage = message.toLowerCase();

  if (
    error.status === 503 ||
    error.code === 503 ||
    lowerMessage.includes("high demand") ||
    lowerMessage.includes("unavailable")
  ) {
    return "選択中のAIモデルが一時的に混雑しています。少し待って再実行するか、API選択をOpenAI/Geminiに切り替えて試してください。";
  }

  if (
    error.status === 429 ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("exceeded your current quota")
  ) {
    return "APIの利用上限、レート制限、または課金設定により処理できません。選択中プロバイダーのAPIキー、課金、利用上限を確認してください。";
  }

  if (error.status === 400) {
    return `APIへのリクエスト形式に問題があります。${message}`;
  }

  if (error.status === 401) {
    return "APIキーが無効です。.env.local のキーを確認してください。";
  }

  if (error.status === 403) {
    return "APIへのアクセスが拒否されました。APIキーの権限、課金設定、またはプロジェクト設定を確認してください。";
  }

  if (lowerMessage.includes("connection error") || lowerMessage.includes("fetch failed")) {
    return "APIへの接続に失敗しました。ネットワーク、プロキシ、VPN、または一時的な通信障害を確認してください。";
  }

  return message || fallback;
}

export function getApiErrorStatus(error: unknown) {
  if (!isErrorLike(error)) return 500;

  if (error.status && error.status >= 400 && error.status < 600) {
    return error.status;
  }

  const lowerMessage = error.message?.toLowerCase() ?? "";
  if (
    error.code === 503 ||
    lowerMessage.includes("high demand") ||
    lowerMessage.includes("unavailable")
  ) {
    return 503;
  }

  if (
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("exceeded your current quota")
  ) {
    return 429;
  }

  if (lowerMessage.includes("connection error") || lowerMessage.includes("fetch failed")) {
    return 502;
  }

  return 500;
}

function isErrorLike(error: unknown): error is ApiErrorLike {
  return typeof error === "object" && error !== null;
}

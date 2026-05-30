import { describe, expect, it } from "vitest";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";

describe("formatApiError", () => {
  it("formats 503 and high demand errors", () => {
    const message = formatApiError({ status: 503, message: "high demand" }, "fallback");

    expect(message).toContain("一時的に混雑");
    expect(getApiErrorStatus({ status: 503 })).toBe(503);
  });

  it("formats 429 quota and rate limit errors", () => {
    const message = formatApiError({ status: 429, message: "rate limit exceeded" }, "fallback");

    expect(message).toContain("利用上限");
    expect(getApiErrorStatus({ message: "quota exceeded" })).toBe(429);
  });

  it("formats 401 and 403 errors", () => {
    expect(formatApiError({ status: 401 }, "fallback")).toContain("APIキーが無効");
    expect(formatApiError({ status: 403 }, "fallback")).toContain("アクセスが拒否");
  });

  it("formats fetch failures", () => {
    const message = formatApiError({ message: "fetch failed" }, "fallback");

    expect(message).toContain("接続に失敗");
    expect(getApiErrorStatus({ message: "connection error" })).toBe(502);
  });
});

import { describe, expect, it } from "vitest";
import { createStoredZip } from "../lib/zip";

describe("createStoredZip", () => {
  it("creates a readable ZIP-shaped buffer", () => {
    const zip = createStoredZip([
      {
        fileName: "README.md",
        buffer: Buffer.from("# Sample\n", "utf8"),
        date: new Date("2026-06-05T00:00:00Z")
      }
    ]);

    expect(zip.subarray(0, 4).toString("hex")).toBe("504b0304");
    expect(zip.includes(Buffer.from("README.md"))).toBe(true);
    expect(zip.subarray(zip.length - 22, zip.length - 18).toString("hex")).toBe("504b0506");
  });
});

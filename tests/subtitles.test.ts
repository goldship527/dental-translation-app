import { describe, expect, it } from "vitest";
import { generateEnglishSrt } from "../lib/subtitles";

describe("generateEnglishSrt", () => {
  it("creates timed SRT blocks from English lecture text", () => {
    const srt = generateEnglishSrt(
      "Today, I will explain implant placement in the maxillary posterior region. Primary stability is targeted at 35 Ncm.",
      20
    );

    expect(srt).toContain("1\n00:00:00,000 -->");
    expect(srt).toContain("maxillary posterior region.");
    expect(srt).toContain("35 Ncm.");
  });

  it("avoids orphaning the final word of a long sentence", () => {
    const srt = generateEnglishSrt(
      "First, on the CT scan, a bone width of approximately 6 mm and a bone height of approximately 10 mm can be confirmed.",
      12
    );

    expect(srt).not.toContain("\nconfirmed.\n\n");
  });

  it("keeps dental units together when wrapping lines", () => {
    const srt = generateEnglishSrt(
      "First, on the CT scan, a bone width of approximately 6 mm and a bone height of approximately 10 mm can be confirmed.",
      12
    );

    expect(srt).not.toContain("6\nmm");
    expect(srt).not.toContain("10\nmm");
  });
});

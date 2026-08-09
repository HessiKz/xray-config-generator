import { describe, expect, it } from "vitest";
import { articleQty } from "../src/server/article-qty";

describe("articleQty", () => {
  it("uses count when present", () => {
    expect(articleQty({ count: 13, description: "x" })).toBe(13);
  });

  it("parses مقدار from description", () => {
    expect(
      articleQty({
        count: null,
        description: "جگر سیاه بره-مقدار 2 فی 14000000 رسید شماره 854",
      }),
    ).toBe(2);
  });

  it("parses عدد from description", () => {
    expect(
      articleQty({
        count: null,
        description: "سیراب و شیردان 15 عدد فی 2500.000 ریال",
      }),
    ).toBe(15);
  });
});

import { describe, expect, it } from "vitest";
import { normalizeProductText, SEED_PRODUCTS } from "../src/server/catalog";

describe("catalog", () => {
  it("normalizes arabic/persian yeh/kaf and spaces", () => {
    expect(normalizeProductText("  جگر  سياه  ")).toBe("جگر سیاه");
    expect(normalizeProductText("كله كامل")).toBe("کله کامل");
  });

  it("keeps head-full and shiraz-only as separate seed products", () => {
    const slugs = SEED_PRODUCTS.map((p) => p.slug);
    expect(slugs).toContain("head-full-lamb");
    expect(slugs).toContain("shiraz-only");
    const shiraz = SEED_PRODUCTS.find((p) => p.slug === "shiraz-only");
    expect(shiraz?.aliases.some((a) => a.includes("سیراب"))).toBe(true);
  });
});

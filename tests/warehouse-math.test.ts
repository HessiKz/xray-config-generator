import { describe, expect, it } from "vitest";
import {
  computeWarehouseLine,
  systemBalance,
  variance,
} from "../src/server/warehouse-math";

describe("warehouse math", () => {
  it("computes system balance", () => {
    expect(systemBalance(383, 357, 732)).toBe(8);
    expect(systemBalance(0, 405.6, 415)).toBe(-9.4);
  });

  it("computes variance", () => {
    expect(variance(8, 0)).toBe(8);
    expect(variance(39.4, 34)).toBe(5.4);
  });

  it("computeWarehouseLine matches PDF formulas", () => {
    const line = computeWarehouseLine({
      opening: 0,
      purchase: 461.1,
      sale: 431.1,
      warehouseBalance: 0,
    });
    expect(line.systemBalance).toBe(30);
    expect(line.variance).toBe(30);
  });
});

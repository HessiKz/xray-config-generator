import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/server/password";

describe("password", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("ceo1234");
    expect(hash).not.toBe("ceo1234");
    expect(await verifyPassword("ceo1234", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

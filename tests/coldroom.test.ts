import { describe, expect, it } from "vitest";
import { MatchStatus } from "@prisma/client";
import {
  shouldCountInInternalShortage,
  sortFefo,
} from "../src/server/coldroom";

describe("coldroom", () => {
  it("sorts FEFO by expiry then entry", () => {
    const sorted = sortFefo([
      {
        id: "b",
        enteredOn: "1405/01/01",
        expiresOn: "1405/02/10",
        quantity: 1,
        matchStatus: MatchStatus.internal_only,
      },
      {
        id: "a",
        enteredOn: "1405/01/02",
        expiresOn: "1405/02/01",
        quantity: 2,
        matchStatus: MatchStatus.internal_only,
      },
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("internal shortage counting rule", () => {
    expect(shouldCountInInternalShortage(MatchStatus.internal_only)).toBe(true);
    expect(shouldCountInInternalShortage(MatchStatus.matched_in_enekas)).toBe(
      false,
    );
  });
});

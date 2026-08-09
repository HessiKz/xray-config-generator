import { MatchStatus } from "@prisma/client";

export type LotLike = {
  id: string;
  enteredOn: string;
  expiresOn: string | null;
  quantity: number;
  matchStatus: MatchStatus;
};

/** FEFO: earliest expiry first; missing expiry falls back to earliest entry. */
export function sortFefo<T extends LotLike>(lots: T[]): T[] {
  return [...lots].sort((a, b) => {
    const ae = a.expiresOn || a.enteredOn;
    const be = b.expiresOn || b.enteredOn;
    return ae.localeCompare(be);
  });
}

export function activeLots<T extends LotLike>(lots: T[]): T[] {
  return lots.filter((l) => l.matchStatus !== MatchStatus.voided);
}

export function coldroomQuantity(lots: LotLike[]) {
  return activeLots(lots)
    .filter((l) => l.matchStatus === MatchStatus.internal_only || l.matchStatus === MatchStatus.matched_in_enekas)
    .reduce((sum, l) => {
      // internal_only and unmatched count; matched_in_enekas still physical until shipped
      if (l.matchStatus === MatchStatus.voided) return sum;
      return sum + l.quantity;
    }, 0);
}

/** Prevent double-count: internal shortage that later matches enekas becomes matched, not additive elsewhere. */
export function shouldCountInInternalShortage(status: MatchStatus) {
  return status === MatchStatus.internal_only;
}

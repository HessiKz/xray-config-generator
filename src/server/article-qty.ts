/** Extract quantity from Enekas article count or Persian description text. */
export function articleQty(a: {
  count?: number | null;
  description?: string | null;
  debit?: number;
  credit?: number;
}) {
  if (a.count != null && !Number.isNaN(Number(a.count)) && Number(a.count) !== 0) {
    return Math.abs(Number(a.count));
  }
  const desc = a.description || "";
  const patterns = [
    /مقدار\s*([0-9]+(?:\.[0-9]+)?)/,
    /([0-9]+(?:\.[0-9]+)?)\s*عدد/,
    /([0-9]+(?:\.[0-9]+)?)\s*کیلو/,
    /کشتار\s*(?:بره|میش|بز)?\s*([0-9]+)/,
  ];
  for (const re of patterns) {
    const m = desc.match(re);
    if (m) return Math.abs(Number(m[1]));
  }
  return 0;
}

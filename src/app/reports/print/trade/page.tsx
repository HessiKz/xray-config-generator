"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function TradePrintInner() {
  const params = useSearchParams();
  const dayParam = params.get("day") || "";
  const [data, setData] = useState<{
    day: string;
    groups: {
      product: string;
      buy: { partner: string | null; qty: number; amount: number }[];
      sell: { partner: string | null; qty: number; amount: number }[];
      buyQty: number;
      sellQty: number;
      buyAmount: number;
      sellAmount: number;
    }[];
  } | null>(null);

  useEffect(() => {
    const url = dayParam
      ? `/api/trade/daily?day=${encodeURIComponent(dayParam)}`
      : "/api/trade/daily";
    void fetch(url)
      .then((r) => r.json())
      .then((d) => setData({ day: d.day, groups: d.groups || [] }));
  }, [dayParam]);

  if (!data) return <p className="p-8">در حال آماده‌سازی گزارش…</p>;

  return (
    <main className="print-sheet mx-auto max-w-5xl bg-white p-8 text-black">
      <div className="mb-6 flex items-start justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold">گزارش خرید/فروش طرف‌حسابی</h1>
          <p>تاریخ: {data.day}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          چاپ / ذخیره PDF
        </button>
      </div>
      {data.groups.map((g) => (
        <section key={g.product} className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">{g.product}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-1 font-medium">خرید</h3>
              <ul className="text-sm">
                {g.buy.map((b, i) => (
                  <li key={i}>
                    {b.partner || "—"}: {b.qty} —{" "}
                    {b.amount.toLocaleString("fa-IR")}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-sm">
                جمع: {g.buyQty} / {g.buyAmount.toLocaleString("fa-IR")}
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-medium">فروش</h3>
              <ul className="text-sm">
                {g.sell.map((s, i) => (
                  <li key={i}>
                    {s.partner || "—"}: {s.qty} —{" "}
                    {s.amount.toLocaleString("fa-IR")}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-sm">
                جمع: {g.sellQty} / {g.sellAmount.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
        </section>
      ))}
      {!data.groups.length ? (
        <p>برای این روز ردیف طرف‌حسابی یافت نشد.</p>
      ) : null}
    </main>
  );
}

export default function TradePrintPage() {
  return (
    <Suspense fallback={<p className="p-8">بارگذاری…</p>}>
      <TradePrintInner />
    </Suspense>
  );
}

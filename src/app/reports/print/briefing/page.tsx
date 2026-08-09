"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function BriefPrintInner() {
  const params = useSearchParams();
  const dayParam = params.get("day") || "";
  const [b, setB] = useState<{
    day: string;
    summary: {
      slaughterersActive: number;
      articleRowsThatDay: number;
      buyAmount: number;
      sellAmount: number;
      plasticIncome: number;
      transportIncome: number;
    };
    warehouseMovements: {
      product: string;
      purchase: number;
      sale: number;
      variance: number;
    }[];
    topSlaughterers: {
      title: string;
      code: string;
      count: number;
      amount: number;
    }[];
  } | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const url = dayParam
      ? `/api/briefing?day=${encodeURIComponent(dayParam)}`
      : "/api/briefing";
    void fetch(url)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || !d.briefing) {
          setError("بارگذاری بریفینگ ناموفق بود");
          return;
        }
        setB(d.briefing);
      })
      .catch(() => setError("خطای شبکه"));
  }, [dayParam]);

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!b) return <p className="p-8">در حال آماده‌سازی…</p>;

  return (
    <main className="print-sheet mx-auto max-w-3xl bg-white p-8 text-black">
      <div className="mb-6 flex justify-between no-print">
        <h1 className="text-2xl font-bold">بریفینگ مدیرعامل — {b.day}</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          چاپ / ذخیره PDF
        </button>
      </div>
      <ul className="mb-6 space-y-1 text-sm">
        <li>کشتارکن فعال: {b.summary.slaughterersActive}</li>
        <li>اسناد روز: {b.summary.articleRowsThatDay}</li>
        <li>خرید: {b.summary.buyAmount.toLocaleString("fa-IR")}</li>
        <li>فروش: {b.summary.sellAmount.toLocaleString("fa-IR")}</li>
        <li>پلاستیک: {b.summary.plasticIncome.toLocaleString("fa-IR")}</li>
        <li>حمل: {b.summary.transportIncome.toLocaleString("fa-IR")}</li>
      </ul>
      <h2 className="mb-2 font-semibold">حرکت انبار</h2>
      <ul className="mb-6 space-y-1 text-sm">
        {b.warehouseMovements.map((m) => (
          <li key={m.product}>
            {m.product}: خرید {m.purchase} / فروش {m.sale} / مغایرت {m.variance}
          </li>
        ))}
      </ul>
      <h2 className="mb-2 font-semibold">برترین کشتارکن‌ها</h2>
      <ul className="space-y-1 text-sm">
        {b.topSlaughterers.map((s) => (
          <li key={s.code}>
            {s.title} ({s.code}): {s.count} / {s.amount.toLocaleString("fa-IR")}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function BriefPrintPage() {
  return (
    <Suspense fallback={<p className="p-8">بارگذاری…</p>}>
      <BriefPrintInner />
    </Suspense>
  );
}

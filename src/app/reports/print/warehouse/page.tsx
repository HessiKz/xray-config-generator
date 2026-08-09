"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WarehousePrintInner() {
  const params = useSearchParams();
  const day = params.get("day") || "";
  const [report, setReport] = useState<{
    day: string;
    lines: {
      productTitle: string;
      unit: string;
      opening: number;
      purchase: number;
      sale: number;
      systemBalance: number;
      warehouseBalance: number;
      variance: number;
    }[];
    summary: { activeSlaughterers: number; workCount: number; articleCount?: number };
  } | null>(null);

  useEffect(() => {
    const url = day
      ? `/api/reports/warehouse-daily?day=${encodeURIComponent(day)}`
      : "/api/reports/warehouse-daily";
    void fetch(url)
      .then((r) => r.json())
      .then((d) => setReport(d.report));
  }, [day]);

  if (!report) return <p>در حال آماده‌سازی گزارش…</p>;

  return (
    <main className="print-sheet mx-auto max-w-5xl bg-white p-8 text-black">
      <div className="mb-6 flex items-start justify-between gap-4 no-print">
        <div>
          <p className="text-sm text-neutral-600">سامانه عملیات فریمان</p>
          <h1 className="text-2xl font-bold">گزارش روزانه انبار</h1>
          <p>تاریخ: {report.day}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          چاپ / ذخیره PDF
        </button>
      </div>
      <div className="mb-4 hidden print:block">
        <h1 className="text-xl font-bold">گزارش روزانه انبار — {report.day}</h1>
        <p className="text-sm">زنجیره گوشت فریمان</p>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {[
              "کالا",
              "مانده قبل",
              "خرید",
              "فروش",
              "مانده سیستم",
              "مانده انبار",
              "مغایرت",
            ].map((h) => (
              <th key={h} className="border border-neutral-300 px-2 py-1 text-right">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.lines.map((l) => (
            <tr key={l.productTitle}>
              <td className="border border-neutral-300 px-2 py-1">
                {l.productTitle}
              </td>
              <td className="border border-neutral-300 px-2 py-1">{l.opening}</td>
              <td className="border border-neutral-300 px-2 py-1">{l.purchase}</td>
              <td className="border border-neutral-300 px-2 py-1">{l.sale}</td>
              <td className="border border-neutral-300 px-2 py-1">
                {l.systemBalance}
              </td>
              <td className="border border-neutral-300 px-2 py-1">
                {l.warehouseBalance}
              </td>
              <td className="border border-neutral-300 px-2 py-1">{l.variance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm">
        کشتارکن فعال: {report.summary.activeSlaughterers} — کار قصاب‌ها:{" "}
        {report.summary.workCount} — اسناد: {report.summary.articleCount ?? "—"}
      </p>
    </main>
  );
}

export default function WarehousePrintPage() {
  return (
    <Suspense fallback={<p className="p-8">بارگذاری…</p>}>
      <WarehousePrintInner />
    </Suspense>
  );
}

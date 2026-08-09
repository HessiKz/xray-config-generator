"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn } from "@/components/ui";

type Line = {
  productId: string;
  productTitle: string;
  unit: string;
  section: string | null;
  opening: number;
  purchase: number;
  sale: number;
  systemBalance: number;
  warehouseBalance: number;
  variance: number;
};

export default function WarehousePage() {
  const [day, setDay] = useState("");
  const [days, setDays] = useState<{ day: string; count: number }[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [summary, setSummary] = useState<{
    activeSlaughterers: number;
    workCount: number;
    articleCount?: number;
  } | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");

  async function load(explicitDay?: string) {
    setMsg("");
    const q = explicitDay || day;
    const url = q
      ? `/api/reports/warehouse-daily?day=${encodeURIComponent(q)}`
      : "/api/reports/warehouse-daily";
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      setMsg("خطا در بارگذاری گزارش");
      return;
    }
    setDay(data.report.day);
    setDays(data.days || []);
    setLines(data.report.lines);
    setSummary(data.report.summary);
    const map: Record<string, number> = {};
    for (const l of data.report.lines as Line[]) {
      map[l.productId] = l.warehouseBalance;
    }
    setCounts(map);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveCounts() {
    const items = Object.entries(counts).map(([productId, quantity]) => ({
      productId,
      quantity: Number(quantity) || 0,
    }));
    const res = await fetch("/api/warehouse/counts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, items }),
    });
    if (!res.ok) {
      setMsg("ذخیره شمارش ناموفق");
      return;
    }
    setMsg("شمارش ذخیره شد — گزارش بازسازی می‌شود");
    await load();
  }

  return (
    <AppShell title="گزارش روزانه انبار">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">تاریخ شمسی</span>
          <input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2"
          />
        </label>
        <Btn variant="line" onClick={() => load(day)}>
          بارگذاری
        </Btn>
        <Btn onClick={saveCounts}>ذخیره مانده انبار</Btn>
        {day ? (
          <>
            <Btn
              variant="line"
              href={`/api/export/warehouse?day=${encodeURIComponent(day)}`}
            >
              دانلود اکسل
            </Btn>
            <Btn
              variant="line"
              href={`/reports/print/warehouse?day=${encodeURIComponent(day)}`}
            >
              چاپ / PDF
            </Btn>
          </>
        ) : null}
      </div>
      {days.length ? (
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
          {days.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => load(d.day)}
              className="underline-offset-2 hover:underline"
            >
              {d.day} ({d.count})
            </button>
          ))}
        </div>
      ) : null}
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      {summary ? (
        <p className="mb-4 text-sm text-[var(--muted)]">
          کشتارکن فعال: {summary.activeSlaughterers} — کار قصاب‌ها:{" "}
          {summary.workCount} — اسناد روز: {summary.articleCount ?? "—"}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[var(--muted)]">
              <th className="py-2 text-right font-medium">کالا</th>
              <th className="py-2 text-left font-medium">مانده قبل</th>
              <th className="py-2 text-left font-medium">خرید</th>
              <th className="py-2 text-left font-medium">فروش</th>
              <th className="py-2 text-left font-medium">مانده سیستم</th>
              <th className="py-2 text-left font-medium">مانده انبار</th>
              <th className="py-2 text-left font-medium">مغایرت</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.productId} className="border-b border-[var(--line)]/60">
                <td className="py-2">{l.productTitle}</td>
                <td className="py-2 tabular-nums">{l.opening}</td>
                <td className="py-2 tabular-nums">{l.purchase}</td>
                <td className="py-2 tabular-nums">{l.sale}</td>
                <td className="py-2 tabular-nums">{l.systemBalance}</td>
                <td className="py-2">
                  <input
                    type="number"
                    className="w-24 rounded border border-[var(--line)] bg-black/20 px-2 py-1 tabular-nums"
                    value={counts[l.productId] ?? 0}
                    onChange={(e) =>
                      setCounts((prev) => ({
                        ...prev,
                        [l.productId]: Number(e.target.value),
                      }))
                    }
                  />
                </td>
                <td
                  className={`py-2 tabular-nums ${
                    Math.abs(l.variance) >= 1 ? "text-[var(--accent)]" : ""
                  }`}
                >
                  {l.variance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

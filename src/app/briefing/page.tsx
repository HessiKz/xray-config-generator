"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Btn, Section, money } from "@/components/ui";

type Briefing = {
  day: string;
  summary: {
    slaughterersActive: number;
    articleRowsThatDay: number;
    buyAmount: number;
    sellAmount: number;
    plasticIncome: number;
    transportIncome: number;
    coldInternalLots: number;
    coldInternalQty: number;
  };
  warehouseMovements: {
    product: string;
    purchase: number;
    sale: number;
    systemBalance: number;
    warehouseBalance: number;
    variance: number;
  }[];
  topSlaughterers: {
    title: string;
    code: string;
    count: number;
    amount: number;
  }[];
  pendingSuggestions: { title: string; reason: string }[];
  activityDays: { day: string; count: number }[];
};

function BriefingInner() {
  const params = useSearchParams();
  const dayParam = params.get("day") || "";
  const [day, setDay] = useState(dayParam);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(explicitDay?: string) {
    setLoading(true);
    setError("");
    const q = explicitDay ?? day;
    const url = q
      ? `/api/briefing?day=${encodeURIComponent(q)}`
      : "/api/briefing";
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.briefing) {
      setError("بارگذاری بریفینگ ناموفق بود");
      setLoading(false);
      return;
    }
    setBriefing(data.briefing);
    setDay(data.briefing.day);
    setLoading(false);
  }

  useEffect(() => {
    void load(dayParam || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayParam]);

  const d = day || briefing?.day || "";

  return (
    <AppShell title="بریفینگ مدیرعامل" subtitle={d ? `تاریخ ${d}` : undefined}>
      <div className="mb-6 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          تاریخ
          <input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm text-[var(--ink)]"
          />
        </label>
        <Btn variant="line" onClick={() => load(day)}>
          بارگذاری
        </Btn>
        {d ? (
          <>
            <Btn
              variant="line"
              href={`/api/export/briefing?day=${encodeURIComponent(d)}`}
            >
              دانلود اکسل
            </Btn>
            <Btn
              variant="line"
              href={`/reports/print/briefing?day=${encodeURIComponent(d)}`}
            >
              چاپ / PDF
            </Btn>
          </>
        ) : null}
        <Btn href="/dashboard" variant="ghost">
          بازگشت به داشبورد
        </Btn>
      </div>

      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      {loading || !briefing ? (
        <p className="text-[var(--muted)]">در حال بارگذاری بریفینگ…</p>
      ) : (
        <>
          <Section title="خلاصه روز">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">فروش</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {money(briefing.summary.sellAmount)}
                </p>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">خرید</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {money(briefing.summary.buyAmount)}
                </p>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">پلاستیک</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {money(briefing.summary.plasticIncome)}
                </p>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">حمل</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {money(briefing.summary.transportIncome)}
                </p>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">کشتارکن فعال</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {briefing.summary.slaughterersActive}
                </p>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">اسناد روز</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {briefing.summary.articleRowsThatDay}
                </p>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">کسری سردخانه</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {briefing.summary.coldInternalLots} /{" "}
                  {briefing.summary.coldInternalQty}
                </p>
              </div>
            </div>
          </Section>

          <Section title="حرکت انبار">
            {briefing.warehouseMovements.length ? (
              <ul className="space-y-2 text-sm">
                {briefing.warehouseMovements.map((m) => (
                  <li key={m.product} className="border-t border-[var(--line)] pt-2">
                    {m.product}: خرید {m.purchase} / فروش {m.sale} / سیستم{" "}
                    {m.systemBalance} / مغایرت{" "}
                    <span className="text-[var(--accent)]">{m.variance}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                حرکت نگاشت‌شده برای این روز کم است. روزهای فعال:{" "}
                {briefing.activityDays.map((x) => x.day).join("، ")}
              </p>
            )}
          </Section>

          <Section title="برترین کشتارکن‌ها">
            <ul className="space-y-2 text-sm">
              {briefing.topSlaughterers.map((s) => (
                <li key={s.code} className="border-t border-[var(--line)] pt-2">
                  {s.title} ({s.code}): {s.count} / {money(s.amount)}
                </li>
              ))}
            </ul>
          </Section>

          {briefing.pendingSuggestions.length ? (
            <Section title="پیشنهاد در انتظار تأیید">
              <ul className="space-y-2 text-sm">
                {briefing.pendingSuggestions.map((s) => (
                  <li key={s.title} className="border-t border-[var(--line)] pt-2">
                    {s.title}
                    <span className="mt-1 block text-[var(--muted)]">{s.reason}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </>
      )}
    </AppShell>
  );
}

export default function BriefingPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="بریفینگ مدیرعامل">
          <p className="text-[var(--muted)]">بارگذاری…</p>
        </AppShell>
      }
    >
      <BriefingInner />
    </Suspense>
  );
}

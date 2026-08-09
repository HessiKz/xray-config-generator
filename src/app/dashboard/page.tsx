"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section, Stat, money } from "@/components/ui";

type Dash = {
  user: { name: string; role: string };
  latestDay: string;
  stats: {
    partners: number;
    slaughterers: number;
    articles: number;
    stores: number;
    pendingSuggestions: number;
    coldInternalLots: number;
    overduePayments: number;
    sellAmount: number;
    buyAmount: number;
    plasticIncome: number;
  };
  briefing: {
    day: string;
    warehouseMovements: {
      product: string;
      purchase: number;
      sale: number;
      variance: number;
      systemBalance: number;
      warehouseBalance: number;
    }[];
    topSlaughterers: {
      title: string;
      code: string;
      count: number;
      amount: number;
    }[];
    pendingSuggestions: { title: string; reason: string }[];
    activityDays: { day: string; count: number }[];
    summary?: {
      transportIncome?: number;
      articleRowsThatDay?: number;
      sellAmount?: number;
      buyAmount?: number;
      plasticIncome?: number;
    };
  };
  syncStates: {
    entity: string;
    recordCount: number;
    lastSuccess: string | null;
    lastError: string | null;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [day, setDay] = useState("");

  async function load(explicitDay?: string) {
    const q = explicitDay || day;
    const url = q
      ? `/api/briefing?day=${encodeURIComponent(q)}`
      : "/api/dashboard";
    if (!q) {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        setError("دسترسی ندارید یا سشن منقضی شده");
        return;
      }
      const json = await res.json();
      setData(json);
      setDay(json.latestDay);
      return;
    }
    const [dashRes, briefRes] = await Promise.all([
      fetch("/api/dashboard"),
      fetch(`/api/briefing?day=${encodeURIComponent(q)}`),
    ]);
    if (!dashRes.ok) {
      setError("دسترسی ندارید یا سشن منقضی شده");
      return;
    }
    const dash = await dashRes.json();
    const brief = await briefRes.json();
    setData({
      ...dash,
      latestDay: brief.briefing?.day || q,
      briefing: brief.briefing,
      stats: {
        ...dash.stats,
        sellAmount: brief.briefing.summary.sellAmount,
        buyAmount: brief.briefing.summary.buyAmount,
        plasticIncome: brief.briefing.summary.plasticIncome,
      },
    });
    setDay(brief.briefing?.day || q);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSync() {
    setSyncing(true);
    setError("");
    try {
      const res = await fetch("/api/sync/enekas", { method: "POST" });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Sync ناموفق");
      await load(day);
    } finally {
      setSyncing(false);
    }
  }

  const d = day || data?.latestDay || "";

  return (
    <AppShell
      title="داشبورد عملیات"
      userName={data?.user.name}
      subtitle="زنجیره گوشت فریمان — منبع انعکاس فقط‌خواندنی"
    >
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      {!data ? (
        <p className="text-[var(--muted)]">در حال بارگذاری…</p>
      ) : (
        <>
          <Section
            title="مرکز دریافت گزارش"
            action={
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
                  تاریخ گزارش
                  <input
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm text-[var(--ink)]"
                  />
                </label>
                <Btn variant="line" onClick={() => load(day)}>
                  بروزرسانی
                </Btn>
              </div>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ReportCard
                title="بریفینگ مدیرعامل"
                body="خلاصه خرید/فروش، انبار، کشتارکن و پیشنهادها"
                excel={`/api/export/briefing?day=${encodeURIComponent(d)}`}
                print={`/reports/print/briefing?day=${encodeURIComponent(d)}`}
                open={
                  d
                    ? `/briefing?day=${encodeURIComponent(d)}`
                    : "/briefing"
                }
              />
              <ReportCard
                title="گزارش روزانه انبار"
                body="مانده قبل، خرید، فروش، سیستم، انبار، مغایرت"
                excel={`/api/export/warehouse?day=${encodeURIComponent(d)}`}
                print={`/reports/print/warehouse?day=${encodeURIComponent(d)}`}
                open={`/warehouse`}
              />
              <ReportCard
                title="خرید و فروش طرف‌حسابی"
                body="سمت کشتارکن و مشتری برای هر کالا"
                excel={`/api/export/trade?day=${encodeURIComponent(d)}`}
                print={`/reports/print/trade?day=${encodeURIComponent(d)}`}
                open="/trade"
              />
              <ReportCard
                title="عملکرد کشتارکن‌ها"
                body="رتبه‌بندی از حساب قصاب‌ها و اسناد mirror"
                excel="/api/export/slaughterers"
                open="/people"
              />
              <ReportCard
                title="سردخانه و کسری"
                body="بچ‌ها، FEFO و وضعیت internal_only"
                open="/coldroom"
              />
              <ReportCard
                title="پیشنهادهای نیازمند تأیید"
                body="هیچ عددی بدون تأیید مدیرعامل اعمال نمی‌شود"
                open="/suggestions"
              />
            </div>
          </Section>

          <Section title={`شاخص‌های روز ${data.latestDay}`}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="فروش روز (ریال)" value={money(data.stats.sellAmount)} />
              <Stat label="خرید روز (ریال)" value={money(data.stats.buyAmount)} />
              <Stat
                label="پلاستیک روز"
                value={money(data.stats.plasticIncome)}
              />
              <Stat
                label="حمل روز"
                value={money(data.briefing.summary?.transportIncome || 0)}
              />
              <Stat label="کشتارکن فعال" value={data.stats.slaughterers} />
              <Stat
                label="اسناد روز"
                value={data.briefing.summary?.articleRowsThatDay || 0}
              />
              <Stat label="پیشنهاد باز" value={data.stats.pendingSuggestions} />
              <Stat label="پرداخت معوق" value={data.stats.overduePayments} />
            </div>
          </Section>

          <Section
            title="حرکت انبار"
            action={
              <Btn
                href={`/api/export/warehouse?day=${encodeURIComponent(d)}`}
                variant="line"
              >
                دانلود اکسل
              </Btn>
            }
          >
            {data.briefing.warehouseMovements.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                      <th className="py-2 text-right font-medium">کالا</th>
                      <th className="py-2 text-left font-medium">خرید</th>
                      <th className="py-2 text-left font-medium">فروش</th>
                      <th className="py-2 text-left font-medium">سیستم</th>
                      <th className="py-2 text-left font-medium">انبار</th>
                      <th className="py-2 text-left font-medium">مغایرت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.briefing.warehouseMovements.map((m) => (
                      <tr key={m.product} className="border-b border-[var(--line)]/50">
                        <td className="py-2">{m.product}</td>
                        <td className="py-2 tabular-nums">{m.purchase}</td>
                        <td className="py-2 tabular-nums">{m.sale}</td>
                        <td className="py-2 tabular-nums">{m.systemBalance}</td>
                        <td className="py-2 tabular-nums">{m.warehouseBalance}</td>
                        <td className="py-2 tabular-nums text-[var(--accent)]">
                          {m.variance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                برای این روز حرکت نگاشت‌شده کم است. روزهای فعال:{" "}
                {data.briefing.activityDays
                  .slice(0, 5)
                  .map((x) => x.day)
                  .join("، ")}
              </p>
            )}
          </Section>

          <Section title="برترین کشتارکن‌ها">
            <ul className="space-y-2 text-sm">
              {data.briefing.topSlaughterers.map((s) => (
                <li key={s.code} className="border-t border-[var(--line)] pt-2">
                  {s.title}{" "}
                  <span className="text-[var(--muted)]">({s.code})</span> —{" "}
                  {s.count} / {money(s.amount)}
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="همگام‌سازی انعکاس"
            action={
              <Btn onClick={runSync} disabled={syncing}>
                {syncing ? "در حال sync…" : "اجرای sync"}
              </Btn>
            }
          >
            <ul className="space-y-2 text-sm">
              {data.syncStates.map((s) => (
                <li key={s.entity} className="border-t border-[var(--line)] pt-2">
                  <span className="text-[var(--accent)]">{s.entity}</span> —{" "}
                  {s.recordCount} رکورد
                  {s.lastSuccess
                    ? ` — ${new Date(s.lastSuccess).toLocaleString("fa-IR")}`
                    : ""}
                  {s.lastError ? (
                    <span className="block text-red-300">{s.lastError}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--muted)]">
              آرتیکل mirror: {data.stats.articles} — طرف‌حساب: {data.stats.partners} — انبارها:{" "}
              {data.stats.stores}
            </p>
          </Section>
        </>
      )}
    </AppShell>
  );
}

function ReportCard({
  title,
  body,
  excel,
  print,
  open,
}: {
  title: string;
  body: string;
  excel?: string;
  print?: string;
  open: string;
}) {
  return (
    <article className="flex min-h-[150px] flex-col justify-between border border-[var(--line)] bg-black/10 p-4">
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn href={open} variant="accent">
          مشاهده
        </Btn>
        {excel ? (
          <Btn href={excel} variant="line">
            اکسل
          </Btn>
        ) : null}
        {print ? (
          <Btn href={print} variant="line">
            چاپ / PDF
          </Btn>
        ) : null}
      </div>
    </article>
  );
}

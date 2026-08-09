"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

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
  syncStates: {
    entity: string;
    recordCount: number;
    lastSuccess: string | null;
    lastError: string | null;
  }[];
};

function money(n: number) {
  return Math.round(n || 0).toLocaleString("fa-IR");
}

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const res = await fetch("/api/dashboard");
    if (!res.ok) {
      setError("دسترسی ندارید یا سشن منقضی شده");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function runSync() {
    setSyncing(true);
    setError("");
    try {
      const res = await fetch("/api/sync/enekas", { method: "POST" });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Sync ناموفق");
      await load();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <AppShell title="داشبورد مدیرعامل" userName={data?.user.name}>
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      {!data ? (
        <p className="text-[var(--muted)]">در حال بارگذاری…</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-[var(--muted)]">
            آخرین روز داده‌دار:{" "}
            <span className="text-[var(--accent)]">{data.latestDay}</span>
          </p>

          <section className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["فروش روز", money(data.stats.sellAmount)],
              ["خرید روز", money(data.stats.buyAmount)],
              ["پلاستیک روز", money(data.stats.plasticIncome)],
              ["کشتارکن فعال", data.stats.slaughterers],
              ["آرتیکل mirror", data.stats.articles],
              ["پیشنهاد باز", data.stats.pendingSuggestions],
              ["کسری سردخانه", data.stats.coldInternalLots],
              ["پرداخت معوق", data.stats.overduePayments],
            ].map(([label, value]) => (
              <div key={String(label)} className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl">حرکت انبار — {data.briefing.day}</h2>
            {data.briefing.warehouseMovements.length ? (
              <ul className="space-y-2 text-sm">
                {data.briefing.warehouseMovements.map((m) => (
                  <li key={m.product} className="border-t border-[var(--line)] pt-2">
                    {m.product}: خرید {m.purchase} / فروش {m.sale} / مغایرت{" "}
                    <span className="text-[var(--accent)]">{m.variance}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-[var(--muted)]">
                برای این روز حرکت کالای نگاشت‌شده کم است. روزهای فعال:
                <ul className="mt-2 space-y-1">
                  {data.briefing.activityDays.map((d) => (
                    <li key={d.day}>
                      {d.day} — {d.count} سند
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="mb-10">
            <h2 className="mb-3 text-xl">برترین کشتارکن‌ها</h2>
            {data.briefing.topSlaughterers.length ? (
              <ul className="space-y-2 text-sm">
                {data.briefing.topSlaughterers.map((s) => (
                  <li key={s.code} className="border-t border-[var(--line)] pt-2">
                    {s.title} ({s.code}): {s.count} / {money(s.amount)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                بعد از sync بیشتر اسناد، رتبه‌بندی پر می‌شود.
              </p>
            )}
          </section>

          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl">همگام‌سازی انعکاس</h2>
              <button
                type="button"
                onClick={runSync}
                disabled={syncing}
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-[#1a1710] disabled:opacity-60"
              >
                {syncing ? "در حال sync…" : "اجرای sync"}
              </button>
            </div>
            <ul className="space-y-3 text-sm">
              {data.syncStates.map((s) => (
                <li key={s.entity} className="border-t border-[var(--line)] pt-2">
                  <span className="text-[var(--accent)]">{s.entity}</span>
                  {" — "}
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
          </section>
        </>
      )}
    </AppShell>
  );
}

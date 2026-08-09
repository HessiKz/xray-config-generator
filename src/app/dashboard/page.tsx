"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Dash = {
  user: { name: string; role: string };
  stats: {
    partners: number;
    slaughterers: number;
    articles: number;
    stores: number;
    pendingSuggestions: number;
    coldInternalLots: number;
    overduePayments: number;
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
    try {
      const res = await fetch("/api/sync/enekas", { method: "POST" });
      if (!res.ok) {
        setError("Sync ناموفق");
      }
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
          <section className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["طرف‌حساب", data.stats.partners],
              ["کشتارکن فعال", data.stats.slaughterers],
              ["آرتیکل", data.stats.articles],
              ["انبارها", data.stats.stores],
              ["پیشنهاد باز", data.stats.pendingSuggestions],
              ["کسری داخلی سردخانه", data.stats.coldInternalLots],
              ["پرداخت معوق", data.stats.overduePayments],
            ].map(([label, value]) => (
              <div key={String(label)} className="border-t border-[var(--line)] pt-3">
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </section>

          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl">وضعیت همگام‌سازی انعکاس</h2>
              <button
                type="button"
                onClick={runSync}
                disabled={syncing}
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-[#1a1710] disabled:opacity-60"
              >
                {syncing ? "در حال sync…" : "اجرای sync"}
              </button>
            </div>
            {data.syncStates.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">هنوز sync اجرا نشده.</p>
            ) : (
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
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

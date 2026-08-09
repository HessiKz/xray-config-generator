"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Group = {
  product: string;
  buy: { partner: string | null; qty: number; amount: number }[];
  sell: { partner: string | null; qty: number; amount: number }[];
  buyQty: number;
  sellQty: number;
  buyAmount: number;
  sellAmount: number;
};

export default function TradePage() {
  const [day, setDay] = useState("1405/05/01");
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const res = await fetch(`/api/trade/daily?day=${encodeURIComponent(day)}`);
    const json = await res.json();
    if (!res.ok) {
      setError("خطا در بارگذاری");
      return;
    }
    setGroups(json.groups || []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell title="خرید و فروش طرف‌حسابی">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">تاریخ</span>
          <input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-[#1a1710]"
        >
          بارگذاری
        </button>
      </div>
      {error ? <p className="text-red-300">{error}</p> : null}
      {groups.length ? (
        <div className="space-y-10">
          {groups.map((p) => (
            <section key={p.product} className="border-t border-[var(--line)] pt-4">
              <h2 className="mb-3 text-lg">{p.product}</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm text-[var(--accent)]">خرید</h3>
                  <ul className="space-y-1 text-sm">
                    {p.buy.length ? (
                      p.buy.map((b, i) => (
                        <li key={i}>
                          {b.partner || "—"}: {b.qty} —{" "}
                          {b.amount.toLocaleString("fa-IR")}
                        </li>
                      ))
                    ) : (
                      <li className="text-[var(--muted)]">—</li>
                    )}
                  </ul>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    جمع: {p.buyQty} / {p.buyAmount.toLocaleString("fa-IR")}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm text-[var(--accent)]">فروش</h3>
                  <ul className="space-y-1 text-sm">
                    {p.sell.length ? (
                      p.sell.map((s, i) => (
                        <li key={i}>
                          {s.partner || "—"}: {s.qty} —{" "}
                          {s.amount.toLocaleString("fa-IR")}
                        </li>
                      ))
                    ) : (
                      <li className="text-[var(--muted)]">—</li>
                    )}
                  </ul>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    جمع: {p.sellQty} / {p.sellAmount.toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)]">
          داده‌ای برای این روز نیست — ابتدا sync انعکاس را اجرا کنید.
        </p>
      )}
    </AppShell>
  );
}

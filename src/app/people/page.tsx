"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

export default function PeoplePage() {
  const [items, setItems] = useState<
    {
      code: string;
      title: string;
      groupCode: string | null;
      performance: { count: number; credit: number; rows: number };
    }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/people/slaughterers");
      const data = await res.json();
      if (!res.ok) {
        setError("خطا در بارگذاری");
        return;
      }
      setItems(data.rows || []);
    })();
  }, []);

  return (
    <AppShell title="کشتارکن‌ها و عملکرد">
      {error ? <p className="text-red-300">{error}</p> : null}
      <ul className="space-y-3 text-sm">
        {items.map((p) => (
          <li key={p.code} className="border-t border-[var(--line)] pt-3">
            <p>
              {p.title}{" "}
              <span className="text-[var(--muted)]">
                ({p.code} / {p.groupCode})
              </span>
            </p>
            <p className="text-[var(--muted)]">
              کار: {p.performance.count} — مبلغ:{" "}
              {p.performance.credit.toLocaleString("fa-IR")}
            </p>
          </li>
        ))}
      </ul>
      {!items.length && !error ? (
        <p className="text-[var(--muted)]">داده‌ای نیست — sync را اجرا کنید.</p>
      ) : null}
    </AppShell>
  );
}

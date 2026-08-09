"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section, money } from "@/components/ui";

export default function PeoplePage() {
  const [items, setItems] = useState<
    {
      code: string;
      title: string;
      groupCode: string | null;
      performance: { count: number; credit: number; rows: number };
    }[]
  >([]);
  const [day, setDay] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [present, setPresent] = useState(true);
  const [msg, setMsg] = useState("");
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

  async function saveAttendance(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/people/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerCode, day, present }),
    });
    if (!res.ok) {
      setMsg("ثبت حضور ناموفق");
      return;
    }
    setMsg("حضور ثبت شد");
  }

  return (
    <AppShell title="کشتارکن‌ها و عملکرد" subtitle="رتبه‌بندی از اسناد mirror انعکاس">
      {error ? <p className="text-red-300">{error}</p> : null}
      <div className="mb-6 flex flex-wrap gap-2">
        <Btn href="/api/export/slaughterers" variant="line">
          دانلود اکسل کشتارکن‌ها
        </Btn>
      </div>

      <Section title="ثبت حضور روزانه">
        <form onSubmit={saveAttendance} className="grid gap-3 sm:grid-cols-4">
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="کد کشتارکن"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            required
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="تاریخ ۱۴۰۵/۰۵/۱۵"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          />
          <select
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={present ? "1" : "0"}
            onChange={(e) => setPresent(e.target.value === "1")}
          >
            <option value="1">حاضر</option>
            <option value="0">غایب</option>
          </select>
          <Btn>ثبت حضور</Btn>
        </form>
        {msg ? <p className="mt-2 text-sm text-[var(--accent)]">{msg}</p> : null}
      </Section>

      <Section title="رتبه‌بندی">
        <ul className="space-y-3 text-sm">
          {items.slice(0, 40).map((p) => (
            <li key={p.code} className="border-t border-[var(--line)] pt-3">
              <p>
                {p.title}{" "}
                <span className="text-[var(--muted)]">
                  ({p.code} / {p.groupCode})
                </span>
              </p>
              <p className="text-[var(--muted)]">
                کار: {p.performance.count} — مبلغ:{" "}
                {money(p.performance.credit)} — اسناد: {p.performance.rows}
              </p>
            </li>
          ))}
        </ul>
        {!items.length && !error ? (
          <p className="text-[var(--muted)]">داده‌ای نیست — sync را اجرا کنید.</p>
        ) : null}
      </Section>
    </AppShell>
  );
}

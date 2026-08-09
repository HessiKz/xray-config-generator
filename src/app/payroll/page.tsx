"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section, money } from "@/components/ui";

type Run = {
  id: string;
  period: string;
  status: string;
  lines: {
    personName: string;
    partnerCode: string | null;
    gross: number;
    loanDeduct: number;
    imprestDeduct: number;
    net: number;
  }[];
};

export default function PayrollPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [period, setPeriod] = useState("1405-05");
  const [personName, setPersonName] = useState("");
  const [gross, setGross] = useState(0);
  const [loan, setLoan] = useState(0);
  const [imprest, setImprest] = useState(0);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/payroll");
    const data = await res.json();
    if (res.ok) setRuns(data.runs || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        period,
        lines: [
          {
            personName,
            gross: Number(gross),
            loanDeduct: Number(loan),
            imprestDeduct: Number(imprest),
          },
        ],
      }),
    });
    if (!res.ok) {
      setMsg("ایجاد پیش‌نویس فقط برای مدیرعامل/ادمین");
      return;
    }
    setMsg("پیش‌نویس حقوق ساخته شد");
    await load();
  }

  return (
    <AppShell title="حقوق عملیاتی" subtitle="پیش‌نویس از حضور/کسورات — بدون نوشتن در انعکاس">
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      <Section title="پیش‌نویس جدید">
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="دوره"
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="نام فرد"
            required
          />
          <input
            type="number"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={gross}
            onChange={(e) => setGross(Number(e.target.value))}
            placeholder="ناخالص"
          />
          <input
            type="number"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value))}
            placeholder="کسر وام"
          />
          <input
            type="number"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={imprest}
            onChange={(e) => setImprest(Number(e.target.value))}
            placeholder="کسر مساعده"
          />
          <Btn>ساخت پیش‌نویس</Btn>
        </form>
      </Section>
      <Section title="دوره‌ها">
        {runs.map((r) => (
          <div key={r.id} className="mb-6 border-t border-[var(--line)] pt-3 text-sm">
            <p className="mb-2">
              دوره {r.period} —{" "}
              <span className="text-[var(--accent)]">{r.status}</span>
            </p>
            <ul className="space-y-1">
              {r.lines.map((l, i) => (
                <li key={i}>
                  {l.personName}: ناخالص {money(l.gross)} / وام {money(l.loanDeduct)} /
                  مساعده {money(l.imprestDeduct)} / خالص{" "}
                  <b>{money(l.net)}</b>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>
    </AppShell>
  );
}

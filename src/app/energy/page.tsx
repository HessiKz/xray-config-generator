"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section, money } from "@/components/ui";

type Bill = {
  id: string;
  utility: string;
  period: string;
  amount: number;
  quantity: number | null;
  note: string | null;
};

const LABELS: Record<string, string> = {
  water: "آب",
  electricity: "برق",
  gas: "گاز",
};

export default function EnergyPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [form, setForm] = useState({
    utility: "electricity",
    period: "",
    amount: 0,
    quantity: 0,
    note: "",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/energy");
    const data = await res.json();
    if (res.ok) setBills(data.bills || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/energy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        utility: form.utility,
        period: form.period,
        amount: Number(form.amount),
        quantity: form.quantity ? Number(form.quantity) : undefined,
        note: form.note || undefined,
      }),
    });
    if (!res.ok) {
      setMsg("ثبت ناموفق");
      return;
    }
    setMsg("قبض ثبت شد");
    await load();
  }

  const total = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <AppShell title="قبوض انرژی" subtitle={`جمع ثبت‌شده: ${money(total)} ریال`}>
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      <Section title="ثبت قبض">
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
          <select
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={form.utility}
            onChange={(e) => setForm({ ...form, utility: e.target.value })}
          >
            <option value="electricity">برق</option>
            <option value="gas">گاز</option>
            <option value="water">آب</option>
          </select>
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="دوره مثل 1405-05"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            required
          />
          <input
            type="number"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="مبلغ"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
          <input
            type="number"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="مقدار مصرف (اختیاری)"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
          <Btn>ثبت قبض</Btn>
        </form>
      </Section>
      <Section title="فهرست قبوض">
        <ul className="space-y-3 text-sm">
          {bills.map((b) => (
            <li key={b.id} className="border-t border-[var(--line)] pt-3">
              {LABELS[b.utility] || b.utility} — دوره {b.period}: {money(b.amount)}
              {b.quantity != null ? ` / مصرف ${b.quantity}` : ""}
            </li>
          ))}
        </ul>
      </Section>
    </AppShell>
  );
}

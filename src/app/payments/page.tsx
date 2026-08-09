"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section, money } from "@/components/ui";

type Item = {
  id: string;
  partnerCode: string;
  title: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  note: string | null;
};

export default function PaymentsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({
    partnerCode: "",
    title: "",
    dueDate: "",
    amount: 0,
    note: "",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/payments");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) {
      setMsg("ثبت ناموفق (نیاز به نقش مدیرعامل/ادمین)");
      return;
    }
    setMsg("تعهد پرداخت ثبت شد");
    setForm({ partnerCode: "", title: "", dueDate: "", amount: 0, note: "" });
    await load();
  }

  async function markPaid(id: string, paid: boolean) {
    const res = await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paid }),
    });
    if (!res.ok) {
      setMsg("تغییر وضعیت ناموفق");
      return;
    }
    await load();
  }

  const overdue = items.filter((i) => !i.paid);

  return (
    <AppShell title="تقویم و معوقات پرداخت" subtitle={`${overdue.length} مورد باز`}>
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      <Section title="ثبت تعهد جدید">
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="کد طرف‌حساب"
            value={form.partnerCode}
            onChange={(e) => setForm({ ...form, partnerCode: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="عنوان"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="سررسید ۱۴۰۵/۰۵/۲۰"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            required
          />
          <input
            type="number"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="مبلغ"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
          <Btn>ثبت</Btn>
        </form>
      </Section>
      <Section title="فهرست">
        <ul className="space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.id} className="border-t border-[var(--line)] pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p>
                    {i.title} — {money(i.amount)} ریال
                  </p>
                  <p className="text-[var(--muted)]">
                    {i.partnerCode} / سررسید {i.dueDate} /{" "}
                    <span className="text-[var(--accent)]">
                      {i.paid ? "پرداخت‌شده" : "باز"}
                    </span>
                  </p>
                </div>
                {!i.paid ? (
                  <Btn variant="line" onClick={() => markPaid(i.id, true)}>
                    پرداخت شد
                  </Btn>
                ) : (
                  <Btn variant="ghost" onClick={() => markPaid(i.id, false)}>
                    بازگردانی
                  </Btn>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </AppShell>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section } from "@/components/ui";

type Item = {
  id: string;
  day: string;
  invoiceType: string | null;
  ref: string | null;
  summary: string;
  createdAt: string;
};

export default function AmendmentsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({
    day: "",
    invoiceType: "رسید اصلاحی",
    ref: "",
    summary: "",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/amendments");
    const data = await res.json();
    if (res.ok) setItems(data.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/amendments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setMsg("ثبت ناموفق");
      return;
    }
    setMsg("اصلاحیه ثبت شد");
    await load();
  }

  return (
    <AppShell title="اصلاحیه اسناد" subtitle="پیگیری اصلاحیه‌های هفتگی بدون دوباره‌کاری">
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      <Section title="ثبت اصلاحیه">
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="تاریخ"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            required
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="نوع سند"
            value={form.invoiceType}
            onChange={(e) => setForm({ ...form, invoiceType: e.target.value })}
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="شماره/ارجاع"
            value={form.ref}
            onChange={(e) => setForm({ ...form, ref: e.target.value })}
          />
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm sm:col-span-2"
            placeholder="خلاصه اصلاحیه"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            required
          />
          <Btn>ثبت</Btn>
        </form>
      </Section>
      <Section title="فهرست">
        <ul className="space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.id} className="border-t border-[var(--line)] pt-3">
              <p>
                {i.day} — {i.invoiceType || "—"} {i.ref ? `(${i.ref})` : ""}
              </p>
              <p className="text-[var(--muted)]">{i.summary}</p>
            </li>
          ))}
        </ul>
      </Section>
    </AppShell>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Lot = {
  id: string;
  storeCode: string;
  productTitle: string;
  quantity: number;
  enteredOn: string;
  expiresOn: string | null;
  matchStatus: string;
  note: string | null;
};

export default function ColdroomPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [internalShortage, setInternalShortage] = useState(0);
  const [form, setForm] = useState({
    storeCode: "18-",
    productTitle: "",
    quantity: 0,
    enteredOn: "1405/05/01",
    expiresOn: "",
    note: "",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/coldroom");
    const data = await res.json();
    if (res.ok) {
      setLots(data.lots);
      setInternalShortage(data.internalShortage);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/coldroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        expiresOn: form.expiresOn || undefined,
        note: form.note || undefined,
      }),
    });
    if (!res.ok) {
      setMsg("ثبت ناموفق");
      return;
    }
    setMsg("بچ/کسری ثبت شد (internal_only)");
    setForm((f) => ({ ...f, productTitle: "", quantity: 0, note: "" }));
    await load();
  }

  async function match(id: string) {
    const res = await fetch("/api/coldroom", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "matched_in_enekas" }),
    });
    if (!res.ok) {
      setMsg("فقط مدیرعامل/ادمین می‌توانند match کنند");
      return;
    }
    setMsg("از محاسبات داخلی خارج شد (matched_in_enekas)");
    await load();
  }

  return (
    <AppShell title="سردخانه و کسری">
      <p className="mb-6 text-sm text-[var(--muted)]">
        کسری داخلی فعال (FEFO / بدون دوبل):{" "}
        <span className="text-[var(--accent)]">{internalShortage}</span>
      </p>
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}

      <form onSubmit={onCreate} className="mb-10 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="کد انبار"
          className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
          value={form.storeCode}
          onChange={(e) => setForm({ ...form, storeCode: e.target.value })}
        />
        <input
          placeholder="نام کالا"
          className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
          value={form.productTitle}
          onChange={(e) => setForm({ ...form, productTitle: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="مقدار"
          className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
        />
        <input
          placeholder="ورود"
          className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
          value={form.enteredOn}
          onChange={(e) => setForm({ ...form, enteredOn: e.target.value })}
        />
        <input
          placeholder="انقضا (اختیاری)"
          className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
          value={form.expiresOn}
          onChange={(e) => setForm({ ...form, expiresOn: e.target.value })}
        />
        <input
          placeholder="یادداشت"
          className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-[#1a1710] sm:col-span-2"
        >
          ثبت کسری/بچ داخلی
        </button>
      </form>

      <ul className="space-y-3 text-sm">
        {lots.map((l) => (
          <li key={l.id} className="border-t border-[var(--line)] pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p>
                  {l.productTitle} — {l.quantity} @ {l.storeCode}
                </p>
                <p className="text-[var(--muted)]">
                  ورود {l.enteredOn} / انقضا {l.expiresOn || "—"} /{" "}
                  <span className="text-[var(--accent)]">{l.matchStatus}</span>
                </p>
              </div>
              {l.matchStatus === "internal_only" ? (
                <button
                  type="button"
                  onClick={() => match(l.id)}
                  className="text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  match با انعکاس
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

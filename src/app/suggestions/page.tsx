"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

type Item = {
  id: string;
  title: string;
  reason: string;
  status: string;
  createdAt: string;
};

export default function SuggestionsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/suggestions");
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function generate() {
    const res = await fetch("/api/suggestions/generate", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMsg("تولید فقط برای مدیرعامل/ادمین");
      return;
    }
    setMsg(`${data.createdCount} پیشنهاد جدید`);
    await load();
  }

  async function decide(id: string, decision: "approved" | "rejected") {
    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    if (!res.ok) {
      setMsg("تصمیم‌گیری ناموفق");
      return;
    }
    await load();
  }

  return (
    <AppShell title="پیشنهادهای هوش مصنوعی">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={generate}
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-[#1a1710]"
        >
          تولید از قواعد
        </button>
        <p className="text-sm text-[var(--muted)]">
          هیچ تغییری بدون تأیید مدیرعامل اعمال نمی‌شود.
        </p>
      </div>
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.id} className="border-t border-[var(--line)] pt-3 text-sm">
            <p className="font-medium">{i.title}</p>
            <p className="mt-1 text-[var(--muted)]">{i.reason}</p>
            <p className="mt-1 text-xs text-[var(--accent)]">{i.status}</p>
            {i.status === "pending" ? (
              <div className="mt-2 flex gap-4">
                <button
                  type="button"
                  onClick={() => decide(i.id, "approved")}
                  className="text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  تأیید
                </button>
                <button
                  type="button"
                  onClick={() => decide(i.id, "rejected")}
                  className="text-[var(--muted)] underline-offset-4 hover:underline"
                >
                  رد
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

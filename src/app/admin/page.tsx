"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";

export default function AdminPage() {
  const [audit, setAudit] = useState<
    {
      id: string;
      action: string;
      entity: string | null;
      createdAt: string;
      user?: { name: string; username: string } | null;
    }[]
  >([]);
  const [syncMsg, setSyncMsg] = useState("");

  async function loadAudit() {
    const res = await fetch("/api/audit");
    const data = await res.json();
    if (res.ok) setAudit(data.items);
  }

  useEffect(() => {
    void loadAudit();
  }, []);

  async function sync() {
    setSyncMsg("در حال sync…");
    const res = await fetch("/api/sync/enekas", { method: "POST" });
    const data = await res.json();
    setSyncMsg(res.ok ? JSON.stringify(data.results || data) : "ناموفق");
    await loadAudit();
  }

  return (
    <AppShell title="ادمین و ممیزی">
      <section className="mb-10">
        <h2 className="mb-3 text-lg">همگام‌سازی انعکاس (read-only)</h2>
        <button
          type="button"
          onClick={sync}
          className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-[#1a1710]"
        >
          اجرای sync کامل
        </button>
        {syncMsg ? (
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-[var(--muted)]">
            {syncMsg}
          </pre>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-lg">لاگ ممیزی</h2>
        <ul className="space-y-2 text-sm">
          {audit.map((a) => (
            <li key={a.id} className="border-t border-[var(--line)] pt-2">
              <span className="text-[var(--accent)]">{a.action}</span>
              {a.entity ? ` / ${a.entity}` : ""}
              {a.user ? ` — ${a.user.name}` : ""}
              <span className="block text-xs text-[var(--muted)]">
                {new Date(a.createdAt).toLocaleString("fa-IR")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

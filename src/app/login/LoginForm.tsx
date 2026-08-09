"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [username, setUsername] = useState("ceo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError("ورود ناموفق — نام کاربری یا رمز اشتباه است");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="mb-2 text-xs tracking-[0.25em] text-[var(--accent)]">
        FARIMAN OPS
      </p>
      <h1 className="mb-2 text-3xl font-semibold">ورود به سامانه</h1>
      <p className="mb-8 text-sm leading-7 text-[var(--muted)]">
        زنجیره گوشت فریمان — لایه عملیاتی جدا از انعکاس
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span>نام کاربری</span>
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span>رمز عبور</span>
          <input
            type="password"
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[#1a1710] disabled:opacity-60"
        >
          {loading ? "در حال ورود…" : "ورود"}
        </button>
      </form>
    </main>
  );
}

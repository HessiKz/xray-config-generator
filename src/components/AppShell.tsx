"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/warehouse", label: "انبار" },
  { href: "/trade", label: "خرید/فروش" },
  { href: "/coldroom", label: "سردخانه" },
  { href: "/people", label: "کشتارکن" },
  { href: "/suggestions", label: "پیشنهادها" },
  { href: "/admin", label: "ادمین" },
];

export function AppShell({
  children,
  title,
  userName,
}: {
  children: React.ReactNode;
  title: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--accent)]">
            FARIMAN OPS
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
          {userName ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{userName}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        >
          خروج
        </button>
      </header>

      <nav className="mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1">{children}</div>
    </div>
  );
}

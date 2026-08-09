import Link from "next/link";

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="border-t border-[var(--line)] pt-3">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  href,
  variant = "accent",
  disabled,
  download,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "accent" | "ghost" | "line";
  disabled?: boolean;
  download?: boolean;
}) {
  const cls =
    variant === "accent"
      ? "bg-[var(--accent)] text-[#1a1710] hover:brightness-110"
      : variant === "line"
        ? "border border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)]"
        : "text-[var(--muted)] underline-offset-4 hover:underline";
  const base =
    variant === "ghost"
      ? `text-sm ${cls}`
      : `inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 ${cls}`;

  if (href) {
    // API export links should be plain anchors so Content-Disposition download works.
    if (href.startsWith("/api/") || download) {
      return (
        <a className={base} href={href}>
          {children}
        </a>
      );
    }
    return (
      <Link className={base} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function money(n: number) {
  return Math.round(n || 0).toLocaleString("fa-IR");
}

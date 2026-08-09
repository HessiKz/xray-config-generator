import Link from "next/link";

const modules = [
  {
    title: "داشبورد و دریافت گزارش",
    body: "بریفینگ مدیرعامل، انبار، خرید/فروش و کشتارکن‌ها با دکمه Excel و چاپ/PDF.",
  },
  {
    title: "انعکاس فقط‌خواندنی",
    body: "طرف‌حساب، حساب‌ها، انبارها و اسناد mirror می‌شوند؛ هیچ نوشتنی روی انعکاس نیست.",
  },
  {
    title: "سردخانه و کسری",
    body: "FEFO و کسری اعلامی با وضعیت internal_only تا matched_in_enekas.",
  },
  {
    title: "ربات تلگرام",
    body: "/brief برای خلاصه واقعی روز — فروش، انبار، کشتارکن و پیشنهادها.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-14 sm:px-10">
      <header className="mb-14 border-b border-[var(--line)] pb-10">
        <p className="mb-3 text-sm tracking-[0.2em] text-[var(--accent)]">
          FARIMAN OPS
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          سامانه عملیات
          <span className="block text-[var(--accent)]">زنجیره گوشت فریمان</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
          محصول جدا از انعکاس مالی. گزارش‌های عملیاتی، هشدارها و تلگرام اینجا
          زندگی می‌کنند.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[#1a1710]"
          >
            ورود به داشبورد
          </Link>
          <Link
            href="/api/health"
            className="rounded-md border border-[var(--line)] px-5 py-2.5 text-sm"
          >
            وضعیت سرویس
          </Link>
        </div>
      </header>

      <section className="grid gap-8 sm:grid-cols-2">
        {modules.map((item) => (
          <article key={item.title} className="border-t border-[var(--line)] pt-5">
            <h2 className="text-xl font-medium">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {item.body}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

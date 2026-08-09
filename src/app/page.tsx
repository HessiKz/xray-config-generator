const modules = [
  {
    title: "گزارش روزانه انبار",
    body: "مانده قبل، خرید، فروش، مانده سیستم، مانده انبار و مغایرت — مطابق قالب فعلی شرکت.",
  },
  {
    title: "خرید و فروش طرف‌حسابی",
    body: "کله کامل، سیراب، جگر و پوست با نگاشت نام‌های انعکاس به کالای استاندارد گزارش.",
  },
  {
    title: "کشتارکن‌ها و پرداخت",
    body: "عملکرد، حضور، رتبه‌بندی و هشدار کم‌کاری از داده فقط‌خواندنی انعکاس.",
  },
  {
    title: "ربات تلگرام مدیرعامل",
    body: "سؤال و گزارش روزانه روی همین هاست؛ فعلاً /status و /report فعال است.",
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
          محصول جدا از انعکاس مالی. انعکاس فقط منبع داده خواندنی است؛ گزارش‌های
          عملیاتی، هشدارها و تلگرام اینجا زندگی می‌کنند.
        </p>
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

      <footer className="mt-16 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
        <a className="underline-offset-4 hover:underline" href="/login">
          ورود به پنل
        </a>
        <a className="underline-offset-4 hover:underline" href="/api/health">
          وضعیت سرویس
        </a>
        <span>هاست: Vercel</span>
        <span>ربات تلگرام فعال</span>
      </footer>
    </main>
  );
}

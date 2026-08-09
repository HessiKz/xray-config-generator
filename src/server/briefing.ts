import { prisma } from "@/server/db";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";
import { daysWithActivity, latestBusinessDay } from "@/server/dates";
import { normalizeProductText } from "@/server/catalog";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function money(n: number) {
  return Math.round(n).toLocaleString("fa-IR");
}

export async function buildCeoBriefing(day?: string) {
  const businessDay = day || (await latestBusinessDay());
  const report = await buildWarehouseDailyReport(businessDay);
  const activityDays = await daysWithActivity(7);

  const dayArticles = await prisma.enekasArticle.findMany({
    where: { invoiceDate: businessDay },
    take: 2000,
  });

  const sellAmount = dayArticles
    .filter((a) => (a.invoiceType || "").includes("فروش"))
    .reduce((s, a) => s + Math.max(a.debit, a.credit), 0);
  const buyAmount = dayArticles
    .filter(
      (a) =>
        (a.invoiceType || "").includes("خرید") ||
        (a.invoiceType || "").includes("رسید"),
    )
    .reduce((s, a) => s + Math.max(a.debit, a.credit), 0);

  const plastic = dayArticles
    .filter((a) => normalizeProductText(`${a.description || ""} ${a.accountTitle || ""}`).includes("پلاستیک"))
    .reduce((s, a) => s + Math.max(a.debit, a.credit), 0);

  const transport = dayArticles
    .filter((a) => /حمل/.test(`${a.description || ""}${a.accountTitle || ""}`))
    .reduce((s, a) => s + Math.max(a.debit, a.credit), 0);

  const work = await prisma.enekasArticle.groupBy({
    by: ["partnerCode", "partnerTitle"],
    where: {
      OR: [
        { accountCode: "211101" },
        { accountTitle: { contains: "قصاب" } },
      ],
      partnerCode: { startsWith: "0101" },
    },
    _sum: { count: true, credit: true, debit: true },
    _count: true,
  });
  const topSlaughterers = work
    .map((w) => ({
      code: w.partnerCode || "",
      title: w.partnerTitle || "—",
      count: w._sum.count || 0,
      amount: Math.max(w._sum.credit || 0, w._sum.debit || 0),
      rows: w._count,
    }))
    .sort((a, b) => b.amount - a.amount || b.count - a.count)
    .slice(0, 8);

  const movements = report.lines
    .filter((l) => l.purchase > 0 || l.sale > 0 || Math.abs(l.variance) >= 0.01)
    .slice(0, 12);

  const pendingSuggestions = await prisma.aiSuggestion.findMany({
    where: { status: "pending" },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const coldInternal = await prisma.coldroomLot.aggregate({
    where: { matchStatus: "internal_only" },
    _sum: { quantity: true },
    _count: true,
  });

  return {
    day: businessDay,
    activityDays,
    summary: {
      slaughterersActive: report.summary.activeSlaughterers,
      articleRowsThatDay: dayArticles.length,
      sellAmount,
      buyAmount,
      plasticIncome: plastic,
      transportIncome: transport,
      coldInternalLots: coldInternal._count,
      coldInternalQty: coldInternal._sum.quantity || 0,
    },
    warehouseMovements: movements.map((l) => ({
      product: l.productTitle,
      purchase: l.purchase,
      sale: l.sale,
      systemBalance: l.systemBalance,
      warehouseBalance: l.warehouseBalance,
      variance: l.variance,
    })),
    topSlaughterers,
    pendingSuggestions: pendingSuggestions.map((s) => ({
      title: s.title,
      reason: s.reason,
    })),
  };
}

export async function formatCeoBriefingHtml(day?: string) {
  const b = await buildCeoBriefing(day);
  const lines = [
    `<b>بریفینگ مدیرعامل — ${esc(b.day)}</b>`,
    `کشتارکن فعال: ${b.summary.slaughterersActive}`,
    `اسناد روز: ${b.summary.articleRowsThatDay}`,
    `خرید روز: ${money(b.summary.buyAmount)} ریال`,
    `فروش روز: ${money(b.summary.sellAmount)} ریال`,
    `درآمد پلاستیک روز: ${money(b.summary.plasticIncome)}`,
    `حمل/درآمد حمل روز: ${money(b.summary.transportIncome)}`,
    `کسری داخلی سردخانه: ${b.summary.coldInternalLots} بچ / ${b.summary.coldInternalQty}`,
    "",
    "<b>حرکت انبار</b>",
  ];
  if (!b.warehouseMovements.length) {
    lines.push("• برای این روز حرکت کالای نگاشت‌شده کم است — روزهای فعال:");
    for (const d of b.activityDays.slice(0, 5)) {
      lines.push(`  - ${esc(d.day)} (${d.count} سند)`);
    }
  } else {
    for (const m of b.warehouseMovements) {
      lines.push(
        `• ${esc(m.product)}: خرید ${m.purchase} / فروش ${m.sale} / سیستم ${m.systemBalance} / مغایرت <b>${m.variance}</b>`,
      );
    }
  }

  lines.push("", "<b>برترین کشتارکن‌ها (از اسناد mirror)</b>");
  if (!b.topSlaughterers.length) {
    lines.push("• هنوز داده عملکرد کافی sync نشده");
  } else {
    for (const s of b.topSlaughterers) {
      lines.push(
        `• ${esc(s.title)} (${esc(s.code)}): مقدار ${s.count} / مبلغ ${money(s.amount)}`,
      );
    }
  }

  if (b.pendingSuggestions.length) {
    lines.push("", "<b>پیشنهاد در انتظار تأیید</b>");
    for (const s of b.pendingSuggestions) {
      lines.push(`• ${esc(s.title)}`);
    }
  }

  lines.push(
    "",
    "<i>منبع: انعکاس فقط‌خواندنی + شمارش/کسری داخلی سامانه</i>",
  );
  return { day: b.day, html: lines.join("\n"), briefing: b };
}

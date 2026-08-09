import { formatCeoBriefingHtml } from "@/server/briefing";
import { prisma } from "@/server/db";
import { daysWithActivity, latestBusinessDay } from "@/server/dates";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function money(n: number) {
  return Math.round(n).toLocaleString("fa-IR");
}

export async function buildLiveStatusText() {
  const syncStates = await prisma.syncState.findMany();
  const partners = await prisma.enekasPartner.count();
  const articles = await prisma.enekasArticle.count();
  const pending = await prisma.aiSuggestion.count({ where: { status: "pending" } });
  const day = await latestBusinessDay();
  const days = await daysWithActivity(5);
  const lines = [
    "<b>وضعیت سامانه عملیات فریمان</b>",
    `• طرف‌حساب mirror: ${partners}`,
    `• آرتیکل mirror: ${articles}`,
    `• آخرین روز کاری داده‌دار: ${esc(day)}`,
    `• پیشنهاد در انتظار تأیید: ${pending}`,
    "",
    "<b>روزهای فعال اخیر</b>",
    ...days.map((d) => `• ${esc(d.day)} — ${d.count} سند`),
    "",
    "<b>Sync</b>",
  ];
  if (syncStates.length === 0) {
    lines.push("• هنوز sync اجرا نشده");
  } else {
    for (const s of syncStates) {
      const when = s.lastSuccess ? s.lastSuccess.toISOString() : "—";
      const err = s.lastError ? ` ERR: ${esc(s.lastError.slice(0, 80))}` : "";
      lines.push(`• ${esc(s.entity)}: ${s.recordCount} @ ${when}${err}`);
    }
  }
  return lines.join("\n");
}

export async function buildLiveReportText(day?: string) {
  const { html } = await formatCeoBriefingHtml(day);
  return html;
}

export async function answerTelegramQuestion(text: string) {
  const q = text.trim();

  if (/^\/?(start|help)$/i.test(q) || /راهنما|کمک/.test(q)) {
    return [
      "<b>سامانه عملیات فریمان</b>",
      "دستورات:",
      "/brief — بریفینگ مدیرعامل",
      "/report — گزارش روز آخر داده‌دار",
      "/status — وضعیت sync",
      "",
      "یا بپرسید: کشتارکن‌ها، انبار، فروش امروز، پلاستیک، سردخانه، پیشنهادها",
    ].join("\n");
  }

  if (/بریف|brief|خلاصه|امروز|مدیرعامل/i.test(q) || q === "/brief") {
    return (await formatCeoBriefingHtml()).html;
  }
  if (/وضعیت|status|سینک|sync/i.test(q)) {
    return buildLiveStatusText();
  }
  if (/گزارش|انبار|مغایرت|report/i.test(q) || q.startsWith("/report")) {
    const dayMatch = q.match(/(\d{4}\/\d{2}\/\d{2})/);
    return buildLiveReportText(dayMatch?.[1]);
  }
  if (/فروش|خرید|پلاستیک|حمل/i.test(q)) {
    const day = await latestBusinessDay();
    const { briefing } = await formatCeoBriefingHtml(day);
    return [
      `<b>خلاصه مالی عملیاتی — ${esc(day)}</b>`,
      `خرید: ${money(briefing.summary.buyAmount)} ریال`,
      `فروش: ${money(briefing.summary.sellAmount)} ریال`,
      `پلاستیک: ${money(briefing.summary.plasticIncome)} ریال`,
      `حمل: ${money(briefing.summary.transportIncome)} ریال`,
      `اسناد روز: ${briefing.summary.articleRowsThatDay}`,
    ].join("\n");
  }
  if (/کشتارکن|قصاب/i.test(q)) {
    const { briefing } = await formatCeoBriefingHtml();
    if (!briefing.topSlaughterers.length) {
      return "هنوز عملکرد کشتارکن از اسناد mirror استخراج نشده. /status را بزنید.";
    }
    return [
      `<b>برترین کشتارکن‌ها</b>`,
      `کشتارکن فعال کل: ${briefing.summary.slaughterersActive}`,
      ...briefing.topSlaughterers.map(
        (p) =>
          `• ${esc(p.title)} (${esc(p.code)}): ${p.count} / ${money(p.amount)}`,
      ),
    ].join("\n");
  }
  if (/سردخانه|کسری|ففو|fefo/i.test(q)) {
    const lots = await prisma.coldroomLot.findMany({
      where: { matchStatus: "internal_only" },
      take: 10,
      orderBy: { expiresOn: "asc" },
    });
    const qty = lots.reduce((s, l) => s + l.quantity, 0);
    return [
      "<b>سردخانه — کسری داخلی</b>",
      `بچ internal_only: ${lots.length} (مقدار ${qty})`,
      ...(lots.length
        ? lots.map(
            (l) =>
              `• ${esc(l.productTitle)} ${l.quantity} — انقضا ${esc(l.expiresOn || "—")}`,
          )
        : ["• کسری داخلی باز ندارید"]),
    ].join("\n");
  }
  if (/پیشنهاد|ai|هوش/i.test(q)) {
    const items = await prisma.aiSuggestion.findMany({
      where: { status: "pending" },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    if (!items.length) return "پیشنهاد در انتظاری نیست.";
    return [
      "<b>پیشنهادهای در انتظار تأیید</b>",
      ...items.map((i) => `• ${esc(i.title)}\n  <i>${esc(i.reason.slice(0, 120))}</i>`),
    ].join("\n");
  }

  // default: give briefing instead of useless help loop
  const day = await latestBusinessDay();
  const report = await buildWarehouseDailyReport(day);
  const nz = report.lines.filter((l) => l.purchase || l.sale).length;
  return [
    "بریفینگ سریع:",
    (await formatCeoBriefingHtml(day)).html,
    "",
    nz
      ? ""
      : "اگر جزئیات کم است، در پنل دکمه «اجرای sync» را بزنید یا بگویید: بریفینگ",
  ]
    .filter(Boolean)
    .join("\n");
}

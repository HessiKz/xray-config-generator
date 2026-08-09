import { prisma } from "@/server/db";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function buildLiveStatusText() {
  const syncStates = await prisma.syncState.findMany();
  const partners = await prisma.enekasPartner.count();
  const articles = await prisma.enekasArticle.count();
  const pending = await prisma.aiSuggestion.count({ where: { status: "pending" } });
  const lines = [
    "<b>وضعیت سامانه عملیات فریمان</b>",
    `• طرف‌حساب mirror: ${partners}`,
    `• آرتیکل mirror: ${articles}`,
    `• پیشنهاد در انتظار تأیید: ${pending}`,
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

export async function buildLiveReportText(day = "1405/05/01") {
  const report = await buildWarehouseDailyReport(day);
  const top = report.lines
    .filter((l) => Math.abs(l.variance) >= 0.01 || l.purchase > 0 || l.sale > 0)
    .slice(0, 12);
  const lines = [
    `<b>گزارش روزانه انبار — ${esc(day)}</b>`,
    `کشتارکن فعال: ${report.summary.activeSlaughterers}`,
    `کار قصاب‌ها (211101 count): ${report.summary.workCount}`,
    "",
  ];
  if (top.length === 0) {
    lines.push("ردیفی با حرکت/مغایرت یافت نشد (ابتدا sync و شمارش انبار).");
  } else {
    for (const l of top) {
      lines.push(
        `• ${esc(l.productTitle)}: خرید ${l.purchase} / فروش ${l.sale} / سیستم ${l.systemBalance} / انبار ${l.warehouseBalance} / مغایرت <b>${l.variance}</b>`,
      );
    }
  }
  return lines.join("\n");
}

export async function answerTelegramQuestion(text: string) {
  const q = text.trim();
  const lower = q.toLowerCase();

  if (/وضعیت|status|سینک|sync/i.test(q) || lower === "وضعیت") {
    return buildLiveStatusText();
  }
  if (/گزارش|انبار|مغایرت|report/i.test(q)) {
    const dayMatch = q.match(/(\d{4}\/\d{2}\/\d{2})/);
    return buildLiveReportText(dayMatch?.[1] || "1405/05/01");
  }
  if (/کشتارکن|قصاب/i.test(q)) {
    const count = await prisma.enekasPartner.count({
      where: { groupCode: "0101", isActive: true },
    });
    const top = await prisma.enekasPartner.findMany({
      where: { groupCode: "0101", isActive: true },
      take: 8,
      orderBy: { title: "asc" },
    });
    return [
      `<b>کشتارکن‌ها</b>`,
      `فعال: ${count}`,
      ...top.map((p) => `• ${esc(p.code)} — ${esc(p.title)}`),
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
      ...lots.map(
        (l) =>
          `• ${esc(l.productTitle)} ${l.quantity} — انقضا ${esc(l.expiresOn || "—")}`,
      ),
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
      ...items.map((i) => `• ${esc(i.title)}`),
    ].join("\n");
  }

  return [
    "سؤال را متوجه نشدم. می‌توانید بپرسید:",
    "• وضعیت / sync",
    "• گزارش انبار 1405/05/01",
    "• کشتارکن‌ها",
    "• سردخانه / کسری",
    "• پیشنهادها",
    "یا دستور /help",
  ].join("\n");
}

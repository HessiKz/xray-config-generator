import { prisma } from "@/server/db";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";

export async function generateRuleSuggestions(day = "1405/05/01") {
  const created: string[] = [];
  const report = await buildWarehouseDailyReport(day);

  for (const line of report.lines) {
    if (Math.abs(line.variance) < 1) continue;
    const title = `مغایرت انبار: ${line.productTitle}`;
    const existing = await prisma.aiSuggestion.findFirst({
      where: {
        title,
        status: "pending",
      },
    });
    if (existing) continue;
    const item = await prisma.aiSuggestion.create({
      data: {
        title,
        reason: `روز ${day}: مانده سیستم ${line.systemBalance}، مانده انبار ${line.warehouseBalance}، مغایرت ${line.variance}`,
        payload: {
          day,
          productId: line.productId,
          variance: line.variance,
          kind: "warehouse_variance",
        },
      },
    });
    created.push(item.id);
  }

  const internalLots = await prisma.coldroomLot.findMany({
    where: { matchStatus: "internal_only" },
  });
  if (internalLots.length > 0) {
    const title = "کسری داخلی سردخانه بدون match انعکاس";
    const existing = await prisma.aiSuggestion.findFirst({
      where: { title, status: "pending" },
    });
    if (!existing) {
      const qty = internalLots.reduce((s, l) => s + l.quantity, 0);
      const item = await prisma.aiSuggestion.create({
        data: {
          title,
          reason: `${internalLots.length} بچ با وضعیت internal_only (جمع مقدار ${qty}) — برای جلوگیری از دوبل‌شماری پس از ثبت در انعکاس match کنید.`,
          payload: { kind: "coldroom_internal", count: internalLots.length, qty },
        },
      });
      created.push(item.id);
    }
  }

  const overdue = await prisma.paymentObligation.count({
    where: { paid: false },
  });
  if (overdue > 0) {
    const title = "پرداخت معوق کشتارکن/طرف‌حساب";
    const existing = await prisma.aiSuggestion.findFirst({
      where: { title, status: "pending" },
    });
    if (!existing) {
      const item = await prisma.aiSuggestion.create({
        data: {
          title,
          reason: `${overdue} تعهد پرداخت پرداخت‌نشده ثبت شده است.`,
          payload: { kind: "overdue_payments", overdue },
        },
      });
      created.push(item.id);
    }
  }

  return { createdCount: created.length, ids: created };
}

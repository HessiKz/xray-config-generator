import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { buildCeoBriefing } from "@/server/briefing";
import { latestBusinessDay } from "@/server/dates";
import { xlsxResponse } from "@/server/export/xlsx";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day =
    req.nextUrl.searchParams.get("day") || (await latestBusinessDay());
  const b = await buildCeoBriefing(day);

  const summaryRows = [
    ["عنوان", "مقدار"],
    ["تاریخ", day],
    ["کشتارکن فعال", b.summary.slaughterersActive],
    ["اسناد روز", b.summary.articleRowsThatDay],
    ["خرید روز", b.summary.buyAmount],
    ["فروش روز", b.summary.sellAmount],
    ["پلاستیک", b.summary.plasticIncome],
    ["حمل", b.summary.transportIncome],
    ["کسری سردخانه (بچ)", b.summary.coldInternalLots],
    ["کسری سردخانه (مقدار)", b.summary.coldInternalQty],
  ];

  const warehouseRows = [
    ["کالا", "خرید", "فروش", "مانده سیستم", "مانده انبار", "مغایرت"],
    ...b.warehouseMovements.map((m) => [
      m.product,
      m.purchase,
      m.sale,
      m.systemBalance,
      m.warehouseBalance,
      m.variance,
    ]),
  ];

  const slaughtererRows = [
    ["کشتارکن", "کد", "مقدار", "مبلغ"],
    ...b.topSlaughterers.map((s) => [s.title, s.code, s.count, s.amount]),
  ];

  return xlsxResponse(`briefing-${day.replaceAll("/", "-")}.xlsx`, [
    { name: "خلاصه", rows: summaryRows, headerRow: 1 },
    { name: "انبار", rows: warehouseRows, headerRow: 1 },
    { name: "کشتارکن‌ها", rows: slaughtererRows, headerRow: 1 },
  ]);
}

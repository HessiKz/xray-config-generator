import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";
import { latestBusinessDay } from "@/server/dates";
import { xlsxResponse } from "@/server/export/xlsx";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day =
    req.nextUrl.searchParams.get("day") || (await latestBusinessDay());
  const report = await buildWarehouseDailyReport(day);

  const detailRows = [
    [
      "تاریخ",
      "بخش",
      "کالا",
      "واحد",
      "مانده قبل",
      "خرید",
      "فروش",
      "مانده سیستم",
      "مانده انبار",
      "مغایرت",
    ],
    ...report.lines.map((l) => [
      day,
      l.section || "",
      l.productTitle,
      l.unit,
      l.opening,
      l.purchase,
      l.sale,
      l.systemBalance,
      l.warehouseBalance,
      l.variance,
    ]),
  ];

  const summaryRows = [
    ["عنوان", "مقدار"],
    ["تاریخ", day],
    ["کشتارکن فعال", report.summary.activeSlaughterers],
    ["کار قصاب‌ها", report.summary.workCount],
    ["اسناد روز", report.summary.articleCount || 0],
  ];

  const safe = day.replaceAll("/", "-");
  return xlsxResponse(`warehouse-${safe}.xlsx`, [
    { name: "گزارش انبار", rows: detailRows, headerRow: 1 },
    { name: "خلاصه", rows: summaryRows, headerRow: 1 },
  ]);
}

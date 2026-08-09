import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { buildCeoBriefing } from "@/server/briefing";
import { latestBusinessDay } from "@/server/dates";
import { csvResponse } from "@/server/export/csv";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day =
    req.nextUrl.searchParams.get("day") || (await latestBusinessDay());
  const b = await buildCeoBriefing(day);
  const rows: (string | number)[][] = [
    ["بریفینگ مدیرعامل", day],
    ["کشتارکن فعال", b.summary.slaughterersActive],
    ["اسناد روز", b.summary.articleRowsThatDay],
    ["خرید روز", b.summary.buyAmount],
    ["فروش روز", b.summary.sellAmount],
    ["پلاستیک", b.summary.plasticIncome],
    ["حمل", b.summary.transportIncome],
    [],
    ["کالا", "خرید", "فروش", "مانده سیستم", "مانده انبار", "مغایرت"],
    ...b.warehouseMovements.map((m) => [
      m.product,
      m.purchase,
      m.sale,
      m.systemBalance,
      m.warehouseBalance,
      m.variance,
    ]),
    [],
    ["کشتارکن", "کد", "مقدار", "مبلغ"],
    ...b.topSlaughterers.map((s) => [s.title, s.code, s.count, s.amount]),
  ];
  return csvResponse(`briefing-${day.replaceAll("/", "-")}.csv`, rows);
}

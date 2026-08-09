import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";
import { daysWithActivity, latestBusinessDay } from "@/server/dates";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day =
    req.nextUrl.searchParams.get("day") || (await latestBusinessDay());
  const report = await buildWarehouseDailyReport(day);
  const days = await daysWithActivity(12);
  return NextResponse.json({ ok: true, report, days });
}

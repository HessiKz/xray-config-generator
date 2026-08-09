import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { buildWarehouseDailyReport } from "@/server/reports/warehouse-daily";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day = req.nextUrl.searchParams.get("day") || "1405/05/01";
  const report = await buildWarehouseDailyReport(day);
  return NextResponse.json({ ok: true, report });
}

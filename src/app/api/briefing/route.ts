import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { buildCeoBriefing } from "@/server/briefing";
import { latestBusinessDay } from "@/server/dates";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day =
    req.nextUrl.searchParams.get("day") || (await latestBusinessDay());
  const briefing = await buildCeoBriefing(day);
  return NextResponse.json({ ok: true, briefing });
}

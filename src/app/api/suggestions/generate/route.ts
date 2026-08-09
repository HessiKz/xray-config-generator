import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { generateRuleSuggestions } from "@/server/suggestions";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["ceo", "admin"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const day =
    req.nextUrl.searchParams.get("day") ||
    ((await req.json().catch(() => ({}))) as { day?: string }).day ||
    "1405/05/01";
  const result = await generateRuleSuggestions(day);
  await audit({
    userId: session.id,
    action: "suggestions_generate",
    meta: result,
  });
  return NextResponse.json({ ok: true, ...result });
}

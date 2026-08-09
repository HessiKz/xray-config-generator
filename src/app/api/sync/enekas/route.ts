import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { audit } from "@/server/audit";
import { runEnekasSync } from "@/server/enekas/sync";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const cron = req.headers.get("authorization");
  const session = await getSession();
  const cronOk =
    cron &&
    process.env.CRON_SECRET &&
    cron === `Bearer ${process.env.CRON_SECRET}`;

  if (!cronOk && (!session || (session.role !== "admin" && session.role !== "ceo"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const results = await runEnekasSync({ articlesLimit: 1000 });
    await audit({
      userId: session?.id,
      action: "enekas_sync",
      meta: { results },
    });
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

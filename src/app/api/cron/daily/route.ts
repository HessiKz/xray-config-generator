import { NextRequest, NextResponse } from "next/server";
import { runEnekasSync } from "@/server/enekas/sync";
import { generateRuleSuggestions } from "@/server/suggestions";
import { audit } from "@/server/audit";

export const runtime = "nodejs";
export const maxDuration = 60;

async function run(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const cronHeader = req.headers.get("x-vercel-cron");
  const secret = process.env.CRON_SECRET;
  const bearerOk = Boolean(secret && auth === `Bearer ${secret}`);
  const queryOk =
    Boolean(secret) && req.nextUrl.searchParams.get("secret") === secret;
  const vercelCronOk = Boolean(cronHeader && process.env.VERCEL && secret);
  if (!bearerOk && !queryOk && !vercelCronOk) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const sync = await runEnekasSync({ articlesLimit: 800 });
  const suggestions = await generateRuleSuggestions("1405/05/01");
  await audit({
    action: "cron_daily",
    meta: { sync, suggestions },
  });
  return NextResponse.json({ ok: true, sync, suggestions });
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}

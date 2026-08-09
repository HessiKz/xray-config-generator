import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fariman-ops",
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    timestamp: new Date().toISOString(),
  });
}

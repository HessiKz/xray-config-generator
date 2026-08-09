import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/server/auth";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  await destroySession();
  if (session) {
    await audit({ userId: session.id, action: "logout" });
  }
  return NextResponse.json({ ok: true });
}

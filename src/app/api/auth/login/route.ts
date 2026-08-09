import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginWithPassword } from "@/server/auth";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const session = await loginWithPassword(body.data.username, body.data.password);
  if (!session) {
    return NextResponse.json({ ok: false, error: "bad_credentials" }, { status: 401 });
  }
  await audit({
    userId: session.id,
    action: "login",
    ip: req.headers.get("x-forwarded-for"),
  });
  return NextResponse.json({ ok: true, user: session });
}

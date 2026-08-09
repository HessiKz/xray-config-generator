import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || !["ceo", "admin"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const items = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { username: true, name: true } } },
  });
  return NextResponse.json({ ok: true, items });
}

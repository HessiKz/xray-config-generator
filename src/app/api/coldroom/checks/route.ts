import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const items = await prisma.coldroomCheck.findMany({
    orderBy: { checkedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ ok: true, items });
}

const schema = z.object({
  storeCode: z.string(),
  checkedAt: z.string().optional(),
  ok: z.boolean().default(true),
  note: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const item = await prisma.coldroomCheck.create({
    data: {
      storeCode: body.data.storeCode,
      checkedAt: body.data.checkedAt ? new Date(body.data.checkedAt) : new Date(),
      ok: body.data.ok,
      note: body.data.note,
      source: body.data.source || "manual",
    },
  });
  await audit({
    userId: session.id,
    action: "coldroom_check_create",
    entity: "ColdroomCheck",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}

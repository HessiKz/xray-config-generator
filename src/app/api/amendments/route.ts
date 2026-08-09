import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day = req.nextUrl.searchParams.get("day");
  const items = await prisma.docAmendment.findMany({
    where: day ? { day } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ ok: true, items });
}

const schema = z.object({
  day: z.string(),
  invoiceType: z.string().optional(),
  ref: z.string().optional(),
  summary: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["ceo", "admin", "warehouse_manager"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const item = await prisma.docAmendment.create({ data: body.data });
  await audit({
    userId: session.id,
    action: "amendment_create",
    entity: "DocAmendment",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}

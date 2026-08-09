import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const items = await prisma.paymentObligation.findMany({
    orderBy: [{ paid: "asc" }, { dueDate: "asc" }],
    take: 200,
  });
  return NextResponse.json({ ok: true, items });
}

const createSchema = z.object({
  partnerCode: z.string(),
  title: z.string(),
  dueDate: z.string(),
  amount: z.number(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["ceo", "admin"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = createSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const item = await prisma.paymentObligation.create({ data: body.data });
  await audit({
    userId: session.id,
    action: "payment_create",
    entity: "PaymentObligation",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}

const patchSchema = z.object({
  id: z.string(),
  paid: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !["ceo", "admin"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = patchSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const item = await prisma.paymentObligation.update({
    where: { id: body.data.id },
    data: { paid: body.data.paid },
  });
  await audit({
    userId: session.id,
    action: "payment_mark",
    entity: "PaymentObligation",
    entityId: item.id,
    meta: { paid: body.data.paid },
  });
  return NextResponse.json({ ok: true, item });
}

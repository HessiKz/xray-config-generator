import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const bills = await prisma.energyBill.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, bills });
}

const schema = z.object({
  utility: z.enum(["water", "electricity", "gas"]),
  period: z.string(),
  amount: z.number(),
  quantity: z.number().optional(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const bill = await prisma.energyBill.create({ data: body.data });
  await audit({
    userId: session.id,
    action: "energy_bill_create",
    entity: "EnergyBill",
    entityId: bill.id,
  });
  return NextResponse.json({ ok: true, bill });
}

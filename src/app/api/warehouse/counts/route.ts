import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const schema = z.object({
  day: z.string().min(8),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      note: z.string().optional(),
    }),
  ),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day = req.nextUrl.searchParams.get("day") || "1405/05/01";
  const items = await prisma.warehouseCount.findMany({ where: { day } });
  return NextResponse.json({ ok: true, day, items });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (
    !session ||
    !["ceo", "admin", "warehouse_manager"].includes(session.role)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const saved = [];
  for (const item of body.data.items) {
    const row = await prisma.warehouseCount.upsert({
      where: {
        day_productId: { day: body.data.day, productId: item.productId },
      },
      create: {
        day: body.data.day,
        productId: item.productId,
        quantity: item.quantity,
        note: item.note,
      },
      update: { quantity: item.quantity, note: item.note },
    });
    saved.push(row);
  }
  await audit({
    userId: session.id,
    action: "warehouse_counts_upsert",
    entity: "WarehouseCount",
    meta: { day: body.data.day, count: saved.length },
  });
  return NextResponse.json({ ok: true, items: saved });
}

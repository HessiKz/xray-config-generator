import { NextRequest, NextResponse } from "next/server";
import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { sortFefo, shouldCountInInternalShortage } from "@/server/coldroom";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const lots = await prisma.coldroomLot.findMany({ orderBy: { enteredOn: "asc" } });
  const fefo = sortFefo(lots);
  const internalShortage = lots
    .filter((l) => shouldCountInInternalShortage(l.matchStatus))
    .reduce((s, l) => s + l.quantity, 0);
  return NextResponse.json({ ok: true, lots: fefo, internalShortage });
}

const createSchema = z.object({
  storeCode: z.string(),
  productTitle: z.string(),
  quantity: z.number(),
  enteredOn: z.string(),
  expiresOn: z.string().optional(),
  note: z.string().optional(),
  sourceType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = createSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const lot = await prisma.coldroomLot.create({
    data: {
      ...body.data,
      matchStatus: MatchStatus.internal_only,
      sourceType: body.data.sourceType || "ceo_shortage",
    },
  });
  await audit({
    userId: session.id,
    action: "coldroom_lot_create",
    entity: "ColdroomLot",
    entityId: lot.id,
  });
  return NextResponse.json({ ok: true, lot });
}

const matchSchema = z.object({
  id: z.string(),
  matchedRef: z.string().optional(),
  status: z.enum(["matched_in_enekas", "voided"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ceo" && session.role !== "admin")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = matchSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const lot = await prisma.coldroomLot.update({
    where: { id: body.data.id },
    data: {
      matchStatus: body.data.status as MatchStatus,
      matchedRef: body.data.matchedRef,
    },
  });
  await audit({
    userId: session.id,
    action: "coldroom_lot_match",
    entity: "ColdroomLot",
    entityId: lot.id,
    meta: { status: body.data.status },
  });
  return NextResponse.json({ ok: true, lot });
}

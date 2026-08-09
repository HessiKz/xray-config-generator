import { NextRequest, NextResponse } from "next/server";
import { TradeSide } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { aliases: { where: { active: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ ok: true, products });
}

const aliasSchema = z.object({
  productId: z.string(),
  sourceText: z.string().min(1),
  side: z.enum(["buy", "sell", "both"]).default("both"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["ceo", "admin", "warehouse_manager"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = aliasSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const alias = await prisma.productAlias.upsert({
    where: {
      sourceText_side: {
        sourceText: body.data.sourceText,
        side: body.data.side as TradeSide,
      },
    },
    create: {
      productId: body.data.productId,
      sourceText: body.data.sourceText,
      side: body.data.side as TradeSide,
    },
    update: {
      productId: body.data.productId,
      active: true,
    },
  });
  await audit({
    userId: session.id,
    action: "catalog_alias_upsert",
    entity: "ProductAlias",
    entityId: alias.id,
  });
  return NextResponse.json({ ok: true, alias });
}

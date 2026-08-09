import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const items = await prisma.aiSuggestion.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ ok: true, items });
}

const decideSchema = z.object({
  id: z.string(),
  decision: z.enum(["approved", "rejected"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ceo" && session.role !== "admin")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = decideSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });

  const item = await prisma.aiSuggestion.update({
    where: { id: body.data.id },
    data: {
      status: body.data.decision,
      decidedAt: new Date(),
      decidedById: session.id,
    },
  });
  await audit({
    userId: session.id,
    action: `suggestion_${body.data.decision}`,
    entity: "AiSuggestion",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}

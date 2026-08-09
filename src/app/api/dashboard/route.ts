import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const [
    partners,
    slaughterers,
    articles,
    stores,
    syncStates,
    pendingSuggestions,
    coldLots,
    overduePayments,
  ] = await Promise.all([
    prisma.enekasPartner.count(),
    prisma.enekasPartner.count({ where: { groupCode: "0101", isActive: true } }),
    prisma.enekasArticle.count(),
    prisma.enekasStore.count(),
    prisma.syncState.findMany(),
    prisma.aiSuggestion.count({ where: { status: "pending" } }),
    prisma.coldroomLot.count({ where: { matchStatus: "internal_only" } }),
    prisma.paymentObligation.count({ where: { paid: false } }),
  ]);

  return NextResponse.json({
    ok: true,
    user: session,
    stats: {
      partners,
      slaughterers,
      articles,
      stores,
      pendingSuggestions,
      coldInternalLots: coldLots,
      overduePayments,
    },
    syncStates,
  });
}

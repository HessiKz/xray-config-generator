import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { buildCeoBriefing } from "@/server/briefing";
import { latestBusinessDay } from "@/server/dates";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const day = await latestBusinessDay();
  const [
    partners,
    slaughterers,
    articles,
    stores,
    syncStates,
    pendingSuggestions,
    coldLots,
    overduePayments,
    briefing,
  ] = await Promise.all([
    prisma.enekasPartner.count(),
    prisma.enekasPartner.count({ where: { groupCode: "0101", isActive: true } }),
    prisma.enekasArticle.count(),
    prisma.enekasStore.count(),
    prisma.syncState.findMany(),
    prisma.aiSuggestion.count({ where: { status: "pending" } }),
    prisma.coldroomLot.count({ where: { matchStatus: "internal_only" } }),
    prisma.paymentObligation.count({ where: { paid: false } }),
    buildCeoBriefing(day),
  ]);

  return NextResponse.json({
    ok: true,
    user: session,
    latestDay: day,
    stats: {
      partners,
      slaughterers,
      articles,
      stores,
      pendingSuggestions,
      coldInternalLots: coldLots,
      overduePayments,
      sellAmount: briefing.summary.sellAmount,
      buyAmount: briefing.summary.buyAmount,
      plasticIncome: briefing.summary.plasticIncome,
    },
    briefing,
    syncStates,
  });
}

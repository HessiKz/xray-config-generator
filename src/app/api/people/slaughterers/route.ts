import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const partners = await prisma.enekasPartner.findMany({
    where: { groupCode: { in: ["0101", "0203"] } },
    orderBy: { title: "asc" },
  });

  const work = await prisma.enekasArticle.groupBy({
    by: ["partnerCode", "partnerTitle"],
    where: {
      OR: [
        { accountCode: "211101" },
        { accountTitle: { contains: "قصاب" } },
      ],
      partnerCode: { startsWith: "0101" },
    },
    _sum: { count: true, credit: true, debit: true },
    _count: true,
  });

  const workMap = new Map(
    work.map((w) => [
      w.partnerCode || "",
      {
        count: w._sum.count || 0,
        credit: Math.max(w._sum.credit || 0, w._sum.debit || 0),
        rows: w._count,
      },
    ]),
  );

  const rows = partners.map((p) => ({
    ...p,
    performance: workMap.get(p.code) || { count: 0, credit: 0, rows: 0 },
  }));

  rows.sort(
    (a, b) => (b.performance.count || 0) - (a.performance.count || 0),
  );

  return NextResponse.json({ ok: true, rows });
}

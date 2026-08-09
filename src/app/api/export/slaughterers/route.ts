import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { csvResponse } from "@/server/export/csv";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const partners = await prisma.enekasPartner.findMany({
    where: { groupCode: "0101", isActive: true },
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
  const map = new Map(
    work.map((w) => [
      w.partnerCode || "",
      {
        count: w._sum.count || 0,
        amount: Math.max(w._sum.credit || 0, w._sum.debit || 0),
        rows: w._count,
      },
    ]),
  );

  const ranked = partners
    .map((p) => ({
      code: p.code,
      title: p.title,
      ...(map.get(p.code) || { count: 0, amount: 0, rows: 0 }),
    }))
    .sort((a, b) => b.amount - a.amount);

  return csvResponse("slaughterers.csv", [
    ["کد", "نام", "مقدار کار", "مبلغ", "تعداد سند"],
    ...ranked.map((r) => [r.code, r.title, r.count, r.amount, r.rows]),
  ]);
}

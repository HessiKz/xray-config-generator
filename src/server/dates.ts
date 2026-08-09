import { prisma } from "@/server/db";

/** Latest Jalali invoice date present in mirrored articles, or a safe demo fallback. */
export async function latestBusinessDay(fallback = "1405/05/15") {
  const row = await prisma.enekasArticle.findFirst({
    where: { invoiceDate: { not: null } },
    orderBy: { invoiceDate: "desc" },
    select: { invoiceDate: true },
  });
  return row?.invoiceDate || fallback;
}

export async function daysWithActivity(limit = 10) {
  const rows = await prisma.enekasArticle.groupBy({
    by: ["invoiceDate"],
    where: { invoiceDate: { not: null } },
    _count: true,
    orderBy: { invoiceDate: "desc" },
    take: limit,
  });
  return rows
    .filter((r) => r.invoiceDate)
    .map((r) => ({ day: r.invoiceDate as string, count: r._count }));
}

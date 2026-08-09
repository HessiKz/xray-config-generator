import { prisma } from "@/server/db";
import { computeWarehouseLine } from "@/server/warehouse-math";
import { normalizeProductText } from "@/server/catalog";
import { articleQty } from "@/server/article-qty";

function bestProductId(
  blob: string,
  products: {
    id: string;
    aliases: { sourceText: string }[];
  }[],
) {
  let best: { id: string; score: number } | null = null;
  for (const product of products) {
    for (const alias of product.aliases) {
      const t = normalizeProductText(alias.sourceText);
      if (!t || !blob.includes(t)) continue;
      const score = t.length;
      if (!best || score > best.score) best = { id: product.id, score };
    }
  }
  return best?.id ?? null;
}

export async function buildWarehouseDailyReport(day: string) {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { aliases: { where: { active: true } } },
    orderBy: { sortOrder: "asc" },
  });

  const articles = await prisma.enekasArticle.findMany({
    where: { invoiceDate: day },
  });

  const counts = await prisma.warehouseCount.findMany({ where: { day } });
  const countMap = new Map(counts.map((c) => [c.productId, c.quantity]));

  const prevRows = await prisma.dailyWarehouseRow.findMany({
    where: { day: { lt: day } },
    orderBy: { day: "desc" },
    take: 500,
  });
  const openingMap = new Map<string, number>();
  for (const r of prevRows) {
    if (!openingMap.has(r.productId)) openingMap.set(r.productId, r.systemBalance);
  }

  const purchaseMap = new Map<string, number>();
  const saleMap = new Map<string, number>();

  for (const a of articles) {
    const blob = normalizeProductText(
      `${a.description || ""} ${a.accountTitle || ""}`,
    );
    const productId = bestProductId(blob, products);
    if (!productId) continue;
    const type = a.invoiceType || "";
    const qty = articleQty(a);
    if (!qty) continue;
    if (type.includes("رسید") || type.includes("خرید")) {
      purchaseMap.set(productId, (purchaseMap.get(productId) || 0) + qty);
    }
    if (type.includes("حواله") || type.includes("فروش")) {
      saleMap.set(productId, (saleMap.get(productId) || 0) + qty);
    }
  }

  const lines = [];
  for (const product of products) {
    const opening = openingMap.get(product.id) || 0;
    const purchase = purchaseMap.get(product.id) || 0;
    const sale = saleMap.get(product.id) || 0;
    const warehouseBalance = countMap.get(product.id) ?? 0;
    const computed = computeWarehouseLine({
      opening,
      purchase,
      sale,
      warehouseBalance,
    });

    const row = await prisma.dailyWarehouseRow.upsert({
      where: { day_productId: { day, productId: product.id } },
      create: {
        day,
        productId: product.id,
        opening,
        purchase,
        sale,
        systemBalance: computed.systemBalance,
        warehouseBalance,
        variance: computed.variance,
      },
      update: {
        opening,
        purchase,
        sale,
        systemBalance: computed.systemBalance,
        warehouseBalance,
        variance: computed.variance,
      },
    });

    lines.push({
      ...row,
      productTitle: product.title,
      unit: product.unit,
      section: product.section,
    });
  }

  const slaughterers = await prisma.enekasPartner.count({
    where: { groupCode: "0101", isActive: true },
  });

  const work = await prisma.enekasArticle.aggregate({
    where: {
      invoiceDate: day,
      OR: [
        { accountCode: "211101" },
        { accountTitle: { contains: "قصاب" } },
      ],
      partnerCode: { startsWith: "0101" },
    },
    _sum: { count: true, credit: true },
  });

  return {
    day,
    lines,
    summary: {
      activeSlaughterers: slaughterers,
      workCount: work._sum.count || 0,
      workCredit: work._sum.credit || 0,
      articleCount: articles.length,
    },
  };
}

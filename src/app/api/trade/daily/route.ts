import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { normalizeProductText } from "@/server/catalog";
import { latestBusinessDay } from "@/server/dates";
import { articleQty } from "@/server/article-qty";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day = req.nextUrl.searchParams.get("day") || (await latestBusinessDay());

  const products = await prisma.product.findMany({
    where: { active: true },
    include: { aliases: true },
    orderBy: { sortOrder: "asc" },
  });

  const articles = await prisma.enekasArticle.findMany({
    where: { invoiceDate: day },
    take: 5000,
    orderBy: { invoiceDate: "desc" },
  });

  const groups = products.map((product) => {
    const aliasTexts = product.aliases.map((a) =>
      normalizeProductText(a.sourceText),
    );
    const matched = articles.filter((a) => {
      const blob = normalizeProductText(
        `${a.description || ""} ${a.accountTitle || ""}`,
      );
      // prefer longer aliases by requiring at least one alias hit; exact product scoring is in warehouse
      return aliasTexts.some((t) => t && blob.includes(t));
    });

    const buys = matched.filter(
      (a) =>
        (a.invoiceType || "").includes("خرید") ||
        (a.invoiceType || "").includes("رسید"),
    );
    const sells = matched.filter(
      (a) =>
        (a.invoiceType || "").includes("فروش") ||
        (a.invoiceType || "").includes("حواله"),
    );

    const mapSide = (rows: typeof matched) =>
      rows.slice(0, 40).map((r) => ({
        partner: r.partnerTitle,
        partnerCode: r.partnerCode,
        qty: articleQty(r),
        amount: Math.max(r.debit, r.credit),
        description: r.description,
        invoiceType: r.invoiceType,
        invoiceDate: r.invoiceDate,
      }));

    return {
      product: product.title,
      buy: mapSide(buys),
      sell: mapSide(sells),
      buyQty: buys.reduce((s, r) => s + articleQty(r), 0),
      sellQty: sells.reduce((s, r) => s + articleQty(r), 0),
      buyAmount: buys.reduce((s, r) => s + Math.max(r.debit, r.credit), 0),
      sellAmount: sells.reduce((s, r) => s + Math.max(r.debit, r.credit), 0),
    };
  }).filter((g) => g.buyQty || g.sellQty || g.buyAmount || g.sellAmount);

  return NextResponse.json({ ok: true, day, groups });
}

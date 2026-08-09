import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { normalizeProductText } from "@/server/catalog";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day = req.nextUrl.searchParams.get("day");

  const products = await prisma.product.findMany({
    where: { active: true },
    include: { aliases: true },
    orderBy: { sortOrder: "asc" },
  });

  const articles = await prisma.enekasArticle.findMany({
    where: day ? { invoiceDate: day } : undefined,
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
      return aliasTexts.some((t) => t && blob.includes(t));
    });

    const buys = matched.filter(
      (a) =>
        (a.invoiceType || "").includes("خرید") ||
        (a.invoiceType || "").includes("رسید") ||
        ((a.partnerCode || "").startsWith("0101") && (a.credit || 0) > 0),
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
        qty: r.count ?? 0,
        amount: Math.max(r.debit, r.credit),
        description: r.description,
        invoiceType: r.invoiceType,
        invoiceDate: r.invoiceDate,
      }));

    return {
      product: product.title,
      buy: mapSide(buys),
      sell: mapSide(sells),
      buyQty: buys.reduce((s, r) => s + (r.count || 0), 0),
      sellQty: sells.reduce((s, r) => s + (r.count || 0), 0),
      buyAmount: buys.reduce((s, r) => s + Math.max(r.debit, r.credit), 0),
      sellAmount: sells.reduce((s, r) => s + Math.max(r.debit, r.credit), 0),
    };
  });

  return NextResponse.json({ ok: true, day, groups });
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { normalizeProductText } from "@/server/catalog";
import { latestBusinessDay } from "@/server/dates";
import { articleQty } from "@/server/article-qty";
import { xlsxResponse } from "@/server/export/xlsx";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day =
    req.nextUrl.searchParams.get("day") || (await latestBusinessDay());

  const products = await prisma.product.findMany({
    where: { active: true },
    include: { aliases: true },
    orderBy: { sortOrder: "asc" },
  });
  const articles = await prisma.enekasArticle.findMany({
    where: { invoiceDate: day },
    take: 5000,
  });

  const rows: (string | number | null)[][] = [
    [
      "تاریخ",
      "کالا",
      "سمت",
      "طرف‌حساب",
      "کد",
      "مقدار",
      "مبلغ",
      "نوع سند",
      "شرح",
    ],
  ];

  for (const product of products) {
    const aliasTexts = product.aliases.map((a) =>
      normalizeProductText(a.sourceText),
    );
    const matched = articles.filter((a) => {
      const blob = normalizeProductText(
        `${a.description || ""} ${a.accountTitle || ""}`,
      );
      return aliasTexts.some((t) => t && blob.includes(t));
    });
    for (const a of matched) {
      const type = a.invoiceType || "";
      const side =
        type.includes("فروش") || type.includes("حواله")
          ? "فروش"
          : type.includes("خرید") || type.includes("رسید")
            ? "خرید"
            : "سایر";
      rows.push([
        day,
        product.title,
        side,
        a.partnerTitle,
        a.partnerCode,
        articleQty(a),
        Math.max(a.debit, a.credit),
        a.invoiceType,
        a.description,
      ]);
    }
  }

  const safe = day.replaceAll("/", "-");
  return xlsxResponse(`trade-${safe}.xlsx`, [
    { name: "خرید و فروش", rows, headerRow: 1 },
  ]);
}

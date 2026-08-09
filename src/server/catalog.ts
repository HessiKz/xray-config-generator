import { TradeSide } from "@prisma/client";
import { prisma } from "@/server/db";

export function normalizeProductText(input: string) {
  return input
    .replace(/\s+/g, " ")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/أ|إ|آ/g, "ا")
    .trim()
    .toLowerCase();
}

export async function resolveProductId(
  sourceText: string,
  side: TradeSide = TradeSide.both,
) {
  const norm = normalizeProductText(sourceText);
  const aliases = await prisma.productAlias.findMany({
    where: { active: true },
    include: { product: true },
  });
  const hit = aliases.find((a) => {
    if (!a.active || !a.product.active) return false;
    if (a.side !== TradeSide.both && a.side !== side) return false;
    return norm.includes(normalizeProductText(a.sourceText));
  });
  return hit?.productId ?? null;
}

export const SEED_PRODUCTS: {
  slug: string;
  title: string;
  unit: string;
  section: string;
  sortOrder: number;
  aliases: string[];
}[] = [
  {
    slug: "liver-black-lamb",
    title: "جگر سیاه بره",
    unit: "کیلوگرم",
    section: "جگر",
    sortOrder: 10,
    aliases: ["جگر سیاه بره", "جگرسیاه بره"],
  },
  {
    slug: "liver-black-ewe",
    title: "جگر سیاه میش",
    unit: "کیلوگرم",
    section: "جگر",
    sortOrder: 20,
    aliases: ["جگر سیاه میش", "جگرسیاه میش"],
  },
  {
    slug: "liver-white",
    title: "جگر سفید",
    unit: "کیلوگرم",
    section: "جگر",
    sortOrder: 30,
    aliases: ["جگر سفید", "جگر سفید گوسفندی", "جگرسفید"],
  },
  {
    slug: "head-full-lamb",
    title: "کله کامل بره",
    unit: "عدد",
    section: "کله",
    sortOrder: 40,
    aliases: [
      "کله کامل بره",
      "کله بره",
      "کله پاچه سیراب شیردان و پی بره",
      "کله پاچه سیراب شیردان پی بره",
    ],
  },
  {
    slug: "head-full-ewe",
    title: "کله کامل میش",
    unit: "عدد",
    section: "کله",
    sortOrder: 50,
    aliases: [
      "کله کامل میش",
      "کله میش",
      "کله پاچه سیراب شیردان و پی میش",
    ],
  },
  {
    slug: "head-full-goat",
    title: "کله کامل بز",
    unit: "عدد",
    section: "کله",
    sortOrder: 60,
    aliases: ["کله کامل بز", "کله بز", "کله پاچه سیراب شیردان و پی بز"],
  },
  {
    slug: "shiraz-only",
    title: "سیراب تکی",
    unit: "عدد",
    section: "کله",
    sortOrder: 70,
    aliases: ["سیراب تکی", "سیراب", "سیراب وشیردان", "سیراب و شیردان"],
  },
  {
    slug: "plastic-income",
    title: "پلاستیک",
    unit: "عدد",
    section: "جانبی",
    sortOrder: 200,
    aliases: ["پلاستیک", "فروش پلاستیک"],
  },
  {
    slug: "transport-carcass",
    title: "حمل لاشه",
    unit: "عدد",
    section: "جانبی",
    sortOrder: 210,
    aliases: ["حمل لاشه", "درآمد حمل", "هزینه ی حمل", "هزینه حمل"],
  },
];

import "dotenv/config";
import { TradeSide } from "@prisma/client";
import { prisma } from "../src/server/db";
import { hashPassword } from "../src/server/password";
import { SEED_PRODUCTS } from "../src/server/catalog";

async function main() {
  const users = [
    {
      username: "ceo",
      name: "مدیرعامل",
      role: "ceo" as const,
      password: "ceo1234",
    },
    {
      username: "warehouse",
      name: "مدیر انبار",
      role: "warehouse_manager" as const,
      password: "wh1234",
    },
    {
      username: "admin",
      name: "ادمین",
      role: "admin" as const,
      password: "admin1234",
    },
  ];

  for (const u of users) {
    const passwordHash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { username: u.username },
      create: {
        username: u.username,
        name: u.name,
        role: u.role,
        passwordHash,
      },
      update: { name: u.name, role: u.role, passwordHash, active: true },
    });
  }

  for (const p of SEED_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        unit: p.unit,
        section: p.section,
        sortOrder: p.sortOrder,
      },
      update: {
        title: p.title,
        unit: p.unit,
        section: p.section,
        sortOrder: p.sortOrder,
        active: true,
      },
    });
    for (const alias of p.aliases) {
      await prisma.productAlias.upsert({
        where: {
          sourceText_side: { sourceText: alias, side: TradeSide.both },
        },
        create: {
          productId: product.id,
          sourceText: alias,
          side: TradeSide.both,
        },
        update: { productId: product.id, active: true },
      });
    }
  }

  // demo warehouse counts + computed rows for today-like jalali sample day
  const day = "1405/05/01";
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  for (const product of products.slice(0, 6)) {
    await prisma.warehouseCount.upsert({
      where: { day_productId: { day, productId: product.id } },
      create: { day, productId: product.id, quantity: 0 },
      update: {},
    });
  }

  await prisma.aiSuggestion.createMany({
    data: [
      {
        title: "بررسی مغایرت جگر سیاه بره",
        reason: "نمونه پیشنهاد: مانده سیستم منفی است؛ نیاز به تأیید مدیر",
        payload: { product: "جگر سیاه بره" },
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete");
  console.log("Users: ceo/ceo1234, warehouse/wh1234, admin/admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

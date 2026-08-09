import "dotenv/config";
import { prisma } from "../src/server/db";
import { verifyPassword } from "../src/server/password";
import { EnekasClient, isReadOnlyGuard } from "../src/server/enekas/client";
import { runEnekasSync } from "../src/server/enekas/sync";
import { buildWarehouseDailyReport } from "../src/server/reports/warehouse-daily";
import { sortFefo, shouldCountInInternalShortage } from "../src/server/coldroom";
import { MatchStatus } from "@prisma/client";
import { generateRuleSuggestions } from "../src/server/suggestions";
import {
  answerTelegramQuestion,
  buildLiveReportText,
  buildLiveStatusText,
} from "../src/server/telegram-qa";
import { computeWarehouseLine } from "../src/server/warehouse-math";

async function main() {
  const phase = process.argv[2] || "all";

  if (phase === "1" || phase === "all") {
    console.log("\n=== PHASE 1: auth/seed ===");
    const ceo = await prisma.user.findUnique({ where: { username: "ceo" } });
    if (!ceo) throw new Error("ceo missing");
    const ok = await verifyPassword("ceo1234", ceo.passwordHash);
    if (!ok) throw new Error("ceo password verify failed");
    console.log("OK ceo role=", ceo.role, "products=", await prisma.product.count());
  }

  if (phase === "2" || phase === "all") {
    console.log("\n=== PHASE 2: enekas sync ===");
    if (!isReadOnlyGuard()) throw new Error("readonly guard false");
    const client = new EnekasClient();
    await client.login();
    console.log("OK login");
    const results = await runEnekasSync({ articlesLimit: 200 });
    console.log("OK sync", JSON.stringify(results, null, 2));
    const failed = results.filter((r) => !r.ok);
    if (failed.length) throw new Error(`sync failed: ${JSON.stringify(failed)}`);
  }

  if (phase === "3" || phase === "all") {
    console.log("\n=== PHASE 3: warehouse report ===");
    const line = computeWarehouseLine({
      opening: 383,
      purchase: 357,
      sale: 732,
      warehouseBalance: 0,
    });
    if (line.systemBalance !== 8 || line.variance !== 8) {
      throw new Error("warehouse math mismatch");
    }
    const report = await buildWarehouseDailyReport("1405/05/01");
    console.log(
      "OK report lines=",
      report.lines.length,
      "slaughterers=",
      report.summary.activeSlaughterers,
    );
  }

  if (phase === "4" || phase === "all") {
    console.log("\n=== PHASE 4: coldroom ===");
    const lot = await prisma.coldroomLot.create({
      data: {
        storeCode: "18-",
        productTitle: "تست کسری",
        quantity: 5,
        enteredOn: "1405/05/01",
        expiresOn: "1405/05/10",
        matchStatus: MatchStatus.internal_only,
        sourceType: "verify_script",
      },
    });
    const lots = await prisma.coldroomLot.findMany({
      where: { sourceType: "verify_script" },
    });
    const sorted = sortFefo(lots);
    if (!shouldCountInInternalShortage(MatchStatus.internal_only)) {
      throw new Error("internal shortage rule broken");
    }
    await prisma.coldroomLot.update({
      where: { id: lot.id },
      data: { matchStatus: MatchStatus.matched_in_enekas, matchedRef: "verify" },
    });
    if (shouldCountInInternalShortage(MatchStatus.matched_in_enekas)) {
      throw new Error("matched lots should not count");
    }
    console.log("OK fefo first=", sorted[0]?.id, "matched excluded");
  }

  if (phase === "5" || phase === "all") {
    console.log("\n=== PHASE 5: trade/energy/payroll/amendment/payment ===");
    const bill = await prisma.energyBill.create({
      data: { utility: "electricity", period: "1405-05", amount: 1000, quantity: 10 },
    });
    const pay = await prisma.paymentObligation.create({
      data: {
        partnerCode: "0101001",
        title: "تست پرداخت",
        dueDate: "1405/05/15",
        amount: 500000,
      },
    });
    const amd = await prisma.docAmendment.create({
      data: {
        day: "1405/05/01",
        invoiceType: "رسید اصلاحی",
        summary: "تست اصلاحیه",
      },
    });
    const att = await prisma.attendanceDay.upsert({
      where: { partnerCode_day: { partnerCode: "0101001", day: "1405/05/01" } },
      create: { partnerCode: "0101001", day: "1405/05/01", present: true },
      update: { present: true },
    });
    console.log("OK energy", bill.id, "payment", pay.id, "amd", amd.id, "att", att.id);
  }

  if (phase === "6" || phase === "all") {
    console.log("\n=== PHASE 6: suggestions + telegram qa ===");
    const gen = await generateRuleSuggestions("1405/05/01");
    console.log("OK suggestions created", gen.createdCount);
    const status = await buildLiveStatusText();
    const report = await buildLiveReportText("1405/05/01");
    const qa = await answerTelegramQuestion("کشتارکن‌ها");
    if (!status.includes("وضعیت") || !report.includes("گزارش") || !qa.includes("کشتارکن")) {
      throw new Error("telegram text builders failed");
    }
    console.log("OK telegram texts lengths", status.length, report.length, qa.length);
  }

  console.log("\nALL REQUESTED PHASE CHECKS PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

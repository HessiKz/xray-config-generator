import { prisma } from "@/server/db";
import { EnekasClient } from "@/server/enekas/client";

async function mark(entity: string, fn: () => Promise<number>) {
  await prisma.syncState.upsert({
    where: { entity },
    create: { entity, lastAttempt: new Date() },
    update: { lastAttempt: new Date(), lastError: null },
  });
  try {
    const count = await fn();
    await prisma.syncState.update({
      where: { entity },
      data: {
        lastSuccess: new Date(),
        recordCount: count,
        lastError: null,
      },
    });
    return { entity, ok: true as const, count };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.syncState.update({
      where: { entity },
      data: { lastError: msg },
    });
    return { entity, ok: false as const, error: msg };
  }
}

async function chunked<T>(items: T[], size: number, fn: (chunk: T[]) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) {
    await fn(items.slice(i, i + size));
  }
}

export async function syncPartners(client: EnekasClient) {
  return mark("partners", async () => {
    const data = await client.sgrid("/acc/partners/list/scenario/Sgrid", 2000);
    const rows = data.rows || [];
    await chunked(rows, 50, async (chunk) => {
      await prisma.$transaction(
        chunk.map((r) => {
          const id = String(r.id);
          return prisma.enekasPartner.upsert({
            where: { id },
            create: {
              id,
              code: String(r.code || id),
              title: String(r.title || ""),
              groupCode: r.group_code ? String(r.group_code) : null,
              groupTitle: r.group_title ? String(r.group_title) : null,
              typeTitle: r.type_title ? String(r.type_title) : null,
              isActive: String(r.is_active ?? "1") === "1",
              level: r.level != null ? String(r.level) : null,
              mobile: r.mobile ? String(r.mobile) : null,
              raw: r as object,
            },
            update: {
              code: String(r.code || id),
              title: String(r.title || ""),
              groupCode: r.group_code ? String(r.group_code) : null,
              groupTitle: r.group_title ? String(r.group_title) : null,
              typeTitle: r.type_title ? String(r.type_title) : null,
              isActive: String(r.is_active ?? "1") === "1",
              level: r.level != null ? String(r.level) : null,
              mobile: r.mobile ? String(r.mobile) : null,
              raw: r as object,
              syncedAt: new Date(),
            },
          });
        }),
      );
    });
    return rows.length;
  });
}

export async function syncAccounts(client: EnekasClient) {
  return mark("accounts", async () => {
    const data = await client.sgrid("/acc/accounts/list/scenario/Sgrid", 2000);
    const rows = data.rows || [];
    await chunked(rows, 50, async (chunk) => {
      await prisma.$transaction(
        chunk.map((r) => {
          const id = String(r.id);
          return prisma.enekasAccount.upsert({
            where: { id },
            create: {
              id,
              code: String(r.account_code || id),
              title: String(r.title || ""),
              level: r.level ? String(r.level) : null,
              type: r.type ? String(r.type) : null,
              isActive: String(r.is_active ?? "1") === "1",
              raw: r as object,
            },
            update: {
              code: String(r.account_code || id),
              title: String(r.title || ""),
              level: r.level ? String(r.level) : null,
              type: r.type ? String(r.type) : null,
              isActive: String(r.is_active ?? "1") === "1",
              raw: r as object,
              syncedAt: new Date(),
            },
          });
        }),
      );
    });
    return rows.length;
  });
}

export async function syncStores(client: EnekasClient) {
  return mark("stores", async () => {
    const data = await client.sgrid("/whs/store/index/scenario/Sgrid", 200);
    const rows = data.rows || [];
    await chunked(rows, 50, async (chunk) => {
      await prisma.$transaction(
        chunk.map((r) => {
          const id = String(r.id);
          return prisma.enekasStore.upsert({
            where: { id },
            create: {
              id,
              code: String(r.code || ""),
              title: String(r.title || ""),
              branchTitle: r.branch_title ? String(r.branch_title) : null,
              storekeeper: r.storekeeper ? String(r.storekeeper) : null,
              raw: r as object,
            },
            update: {
              code: String(r.code || ""),
              title: String(r.title || ""),
              branchTitle: r.branch_title ? String(r.branch_title) : null,
              storekeeper: r.storekeeper ? String(r.storekeeper) : null,
              raw: r as object,
              syncedAt: new Date(),
            },
          });
        }),
      );
    });
    return rows.length;
  });
}

function mapArticle(r: Record<string, unknown>) {
  const id = String(r.id);
  const data = {
    invoiceId: r.invoice_id ? String(r.invoice_id) : null,
    invoiceNumber: r.invoice_number ? String(r.invoice_number) : null,
    invoiceDate: r.invoice_date ? String(r.invoice_date) : null,
    invoiceType: r.invoice_type ? String(r.invoice_type) : null,
    invoiceStatus: r.invoice_status ? String(r.invoice_status) : null,
    accountCode: r.account_code ? String(r.account_code) : null,
    accountTitle: r.account_title ? String(r.account_title) : null,
    partnerId: r.partner_id ? String(r.partner_id) : null,
    partnerCode: r.partner_code ? String(r.partner_code) : null,
    partnerTitle: r.partner_title ? String(r.partner_title) : null,
    description: r.description ? String(r.description) : null,
    debit: Number(r.debit || 0),
    credit: Number(r.credit || 0),
    count: r.count != null && r.count !== "" ? Number(r.count) : null,
    branchTitle: r.branch_title ? String(r.branch_title) : null,
    raw: r as object,
    syncedAt: new Date(),
  };
  return { id, data };
}

export async function syncArticlesSample(client: EnekasClient, rowsLimit = 800) {
  return mark("articles", async () => {
    const pageSize = 200;
    const pages = Math.max(1, Math.ceil(rowsLimit / pageSize));
    const seen = new Map<string, Record<string, unknown>>();
    for (let page = 1; page <= pages && seen.size < rowsLimit; page++) {
      const data = await client.sgrid(
        "/acc/articles/index/scenario/Sgrid",
        pageSize,
        page,
        { sidx: "invoice_date", sord: "desc" },
      );
      const rows = data.rows || [];
      if (!rows.length) break;
      for (const r of rows) {
        seen.set(String(r.id), r);
        if (seen.size >= rowsLimit) break;
      }
      if (rows.length < pageSize) break;
    }
    const rows = [...seen.values()];
    await chunked(rows, 40, async (chunk) => {
      await prisma.$transaction(
        chunk.map((r) => {
          const { id, data } = mapArticle(r);
          return prisma.enekasArticle.upsert({
            where: { id },
            create: { id, ...data },
            update: data,
          });
        }),
      );
    });
    return rows.length;
  });
}

export async function runEnekasSync(opts?: { articlesLimit?: number }) {
  const client = new EnekasClient({ timeoutMs: 90_000 });
  await client.login();
  const results = [];
  results.push(await syncStores(client));
  results.push(await syncAccounts(client));
  results.push(await syncPartners(client));
  results.push(await syncArticlesSample(client, opts?.articlesLimit ?? 300));
  return results;
}

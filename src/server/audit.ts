import { prisma } from "@/server/db";

export async function audit(input: {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  ip?: string | null;
}) {
  await prisma.auditEvent.create({
    data: {
      userId: input.userId ?? undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      meta: input.meta,
      ip: input.ip ?? undefined,
    },
  });
}

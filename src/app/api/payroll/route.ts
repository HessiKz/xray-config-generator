import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const runs = await prisma.payrollRun.findMany({
    include: { lines: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ ok: true, runs });
}

const schema = z.object({
  period: z.string(),
  lines: z.array(
    z.object({
      personName: z.string(),
      partnerCode: z.string().optional(),
      gross: z.number(),
      loanDeduct: z.number().default(0),
      imprestDeduct: z.number().default(0),
    }),
  ),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ceo" && session.role !== "admin")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });

  const run = await prisma.payrollRun.create({
    data: {
      period: body.data.period,
      status: "draft",
      lines: {
        create: body.data.lines.map((l) => ({
          personName: l.personName,
          partnerCode: l.partnerCode,
          gross: l.gross,
          loanDeduct: l.loanDeduct,
          imprestDeduct: l.imprestDeduct,
          net: l.gross - l.loanDeduct - l.imprestDeduct,
        })),
      },
    },
    include: { lines: true },
  });
  await audit({
    userId: session.id,
    action: "payroll_run_create",
    entity: "PayrollRun",
    entityId: run.id,
  });
  return NextResponse.json({ ok: true, run });
}

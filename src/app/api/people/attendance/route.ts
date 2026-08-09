import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const day = req.nextUrl.searchParams.get("day");
  const items = await prisma.attendanceDay.findMany({
    where: day ? { day } : undefined,
    orderBy: { day: "desc" },
    take: 300,
  });
  return NextResponse.json({ ok: true, items });
}

const schema = z.object({
  partnerCode: z.string(),
  day: z.string(),
  present: z.boolean().default(true),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["ceo", "admin", "warehouse_manager", "operator"].includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ ok: false }, { status: 400 });
  const item = await prisma.attendanceDay.upsert({
    where: {
      partnerCode_day: {
        partnerCode: body.data.partnerCode,
        day: body.data.day,
      },
    },
    create: body.data,
    update: { present: body.data.present, note: body.data.note },
  });
  await audit({
    userId: session.id,
    action: "attendance_upsert",
    entity: "AttendanceDay",
    entityId: item.id,
  });
  return NextResponse.json({ ok: true, item });
}

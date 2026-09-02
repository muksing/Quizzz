import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  if (id === session!.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่สามารถถอดสิทธิ์ admin ของตัวเองได้" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  if (id === session!.user.id) {
    return NextResponse.json({ error: "ไม่สามารถลบบัญชีตัวเองได้" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

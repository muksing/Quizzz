import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const startSchema = z.object({
  gameId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: parsed.data.gameId } });
  if (!game || !game.published) {
    return NextResponse.json({ error: "ไม่พบเกมนี้" }, { status: 404 });
  }

  const membership = await prisma.classMembership.findUnique({
    where: { userId_classRoomId: { userId: session.user.id, classRoomId: game.classRoomId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "คุณไม่ได้อยู่ในห้องเรียนนี้" }, { status: 403 });
  }

  const attempt = await prisma.attempt.upsert({
    where: { gameId_studentId: { gameId: game.id, studentId: session.user.id } },
    update: {},
    create: { gameId: game.id, studentId: session.user.id },
  });

  return NextResponse.json({ attempt }, { status: 201 });
}

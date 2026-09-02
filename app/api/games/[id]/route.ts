import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedGame } from "@/lib/game-access";

const updateGameSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  published: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      stations: { orderBy: { order: "asc" } },
      classRoom: true,
    },
  });

  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwnerTeacher = session.user.role === "TEACHER" && game.classRoom.teacherId === session.user.id;
  const isStudentInClass =
    session.user.role === "STUDENT" &&
    (await prisma.classMembership.findUnique({
      where: { userId_classRoomId: { userId: session.user.id, classRoomId: game.classRoomId } },
    }));

  if (!isOwnerTeacher && !(isStudentInClass && game.published)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ game });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await getOwnedGame(id, session.user.id);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const updated = await prisma.game.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ game: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await getOwnedGame(id, session.user.id);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.game.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

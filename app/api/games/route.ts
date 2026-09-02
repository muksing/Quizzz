import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createGameSchema = z.object({
  classRoomId: z.string().min(1),
  title: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  type: z.enum(["MARKER", "LOCATION", "IMAGE_TARGET", "FACE_FILTER", "GESTURE"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const classRoom = await prisma.classRoom.findUnique({
    where: { id: parsed.data.classRoomId },
  });
  if (!classRoom || classRoom.teacherId !== session.user.id) {
    return NextResponse.json({ error: "ไม่พบห้องเรียนนี้" }, { status: 404 });
  }

  const game = await prisma.game.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      classRoomId: parsed.data.classRoomId,
    },
  });

  return NextResponse.json({ game }, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const joinSchema = z.object({
  joinCode: z.string().min(1).max(20),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "กรุณากรอกโค้ดห้องเรียน" }, { status: 400 });
  }

  const classRoom = await prisma.classRoom.findUnique({
    where: { joinCode: parsed.data.joinCode.trim().toUpperCase() },
  });

  if (!classRoom) {
    return NextResponse.json({ error: "ไม่พบห้องเรียนนี้" }, { status: 404 });
  }

  const membership = await prisma.classMembership.upsert({
    where: {
      userId_classRoomId: { userId: session.user.id, classRoomId: classRoom.id },
    },
    update: {},
    create: { userId: session.user.id, classRoomId: classRoom.id },
  });

  return NextResponse.json({ membership, classRoom }, { status: 201 });
}

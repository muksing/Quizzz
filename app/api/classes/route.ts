import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateJoinCode } from "@/lib/join-code";

const createClassSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await prisma.classRoom.findMany({
    where: { teacherId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, games: true } },
    },
  });

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  let joinCode = generateJoinCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await prisma.classRoom.findUnique({ where: { joinCode } });
    if (!existing) break;
    joinCode = generateJoinCode();
  }

  const classRoom = await prisma.classRoom.create({
    data: {
      name: parsed.data.name,
      joinCode,
      teacherId: session.user.id,
    },
  });

  return NextResponse.json({ classRoom }, { status: 201 });
}

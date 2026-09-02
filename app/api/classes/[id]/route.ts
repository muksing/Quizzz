import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const classRoom = await prisma.classRoom.findUnique({
    where: { id },
    include: {
      games: { orderBy: { createdAt: "desc" } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!classRoom || classRoom.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ classRoom });
}

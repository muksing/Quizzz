import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const progressSchema = z.object({
  stationId: z.string().min(1),
  correct: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { game: { include: { stations: true } } },
  });

  if (!attempt || attempt.studentId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const station = attempt.game.stations.find((s) => s.id === parsed.data.stationId);
  if (!station) {
    return NextResponse.json({ error: "ไม่พบด่านนี้ในเกม" }, { status: 404 });
  }

  const progress = (attempt.stationsProgress as Record<string, { correct?: boolean; completedAt: string }>) || {};
  const alreadyDone = Boolean(progress[station.id]);
  progress[station.id] = { correct: parsed.data.correct, completedAt: new Date().toISOString() };

  const scoreDelta = !alreadyDone && parsed.data.correct ? 1 : 0;
  const allDone = attempt.game.stations.every((s) => progress[s.id]);

  const updated = await prisma.attempt.update({
    where: { id },
    data: {
      stationsProgress: progress,
      score: attempt.score + scoreDelta,
      completedAt: allDone ? attempt.completedAt ?? new Date() : attempt.completedAt,
    },
  });

  return NextResponse.json({ attempt: updated });
}

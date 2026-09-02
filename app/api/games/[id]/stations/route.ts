import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedGame } from "@/lib/game-access";

const createStationSchema = z.object({
  title: z.string().min(1).max(150),
  config: z.record(z.string(), z.any()),
  contentType: z.enum(["MODEL_3D", "IMAGE", "TEXT", "QUIZ"]),
  contentUrl: z.string().url().optional().or(z.literal("")),
  textContent: z.string().max(2000).optional(),
  quizQuestion: z.string().max(500).optional(),
  quizOptions: z.array(z.string().max(200)).max(6).optional(),
  correctOptionIndex: z.number().int().min(0).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await getOwnedGame(id, session.user.id);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createStationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.flatten() }, { status: 400 });
  }

  const maxOrder = await prisma.station.aggregate({
    where: { gameId: id },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const station = await prisma.station.create({
    data: {
      gameId: id,
      order: nextOrder,
      title: parsed.data.title,
      config: parsed.data.config,
      contentType: parsed.data.contentType,
      contentUrl: parsed.data.contentUrl || null,
      textContent: parsed.data.textContent || null,
      quizQuestion: parsed.data.quizQuestion || null,
      quizOptions: parsed.data.quizOptions ?? undefined,
      correctOptionIndex: parsed.data.correctOptionIndex ?? null,
    },
  });

  return NextResponse.json({ station }, { status: 201 });
}

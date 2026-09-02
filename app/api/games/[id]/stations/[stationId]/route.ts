import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedGame } from "@/lib/game-access";

const updateStationSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  order: z.number().int().min(0).optional(),
  config: z.record(z.string(), z.any()).optional(),
  contentType: z.enum(["MODEL_3D", "IMAGE", "TEXT", "QUIZ"]).optional(),
  contentUrl: z.string().url().optional().or(z.literal("")),
  textContent: z.string().max(2000).optional().or(z.literal("")),
  quizQuestion: z.string().max(500).optional().or(z.literal("")),
  quizOptions: z.array(z.string().max(200)).max(6).optional(),
  correctOptionIndex: z.number().int().min(0).optional(),
});

async function assertOwnership(gameId: string, teacherId: string) {
  const game = await getOwnedGame(gameId, teacherId);
  return game;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; stationId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stationId } = await params;
  const game = await assertOwnership(id, session.user.id);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateStationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.contentUrl === "") data.contentUrl = null;
  if (data.textContent === "") data.textContent = null;
  if (data.quizQuestion === "") data.quizQuestion = null;

  const station = await prisma.station.update({
    where: { id: stationId, gameId: id },
    data,
  });

  return NextResponse.json({ station });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; stationId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stationId } = await params;
  const game = await assertOwnership(id, session.user.id);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.station.delete({ where: { id: stationId, gameId: id } });
  return NextResponse.json({ success: true });
}

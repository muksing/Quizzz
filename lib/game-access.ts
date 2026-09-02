import { prisma } from "@/lib/prisma";

// Returns the game (with its classRoom) if it exists and belongs to a class taught by teacherId, else null.
export async function getOwnedGame(gameId: string, teacherId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { classRoom: true },
  });
  if (!game || game.classRoom.teacherId !== teacherId) return null;
  return game;
}

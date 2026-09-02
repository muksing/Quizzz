import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GamePlayer } from "@/components/ar/GamePlayer";

export default async function PlayGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/play/${gameId}`);

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { stations: { orderBy: { order: "asc" } }, classRoom: true },
  });
  if (!game) notFound();

  const isOwnerTeacher = session.user.role === "TEACHER" && game.classRoom.teacherId === session.user.id;

  let isMember = false;
  if (session.user.role === "STUDENT") {
    const membership = await prisma.classMembership.findUnique({
      where: { userId_classRoomId: { userId: session.user.id, classRoomId: game.classRoomId } },
    });
    isMember = Boolean(membership);
  }

  if (!isOwnerTeacher && !(isMember && game.published)) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <GamePlayer
        gameId={game.id}
        gameTitle={game.title}
        gameType={game.type}
        stations={game.stations.map((s) => ({
          ...s,
          config: s.config as Record<string, unknown>,
          quizOptions: s.quizOptions as string[] | null,
          activityData: s.activityData as Record<string, unknown> | null,
        }))}
        canRecordProgress={session.user.role === "STUDENT"}
      />
    </div>
  );
}

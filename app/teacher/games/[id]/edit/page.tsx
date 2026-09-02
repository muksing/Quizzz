import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedGame } from "@/lib/game-access";
import { prisma } from "@/lib/prisma";
import { GameSettingsForm } from "@/components/teacher/GameSettingsForm";
import { StationManager } from "@/components/teacher/StationManager";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const game = await getOwnedGame(id, session!.user.id);
  if (!game) notFound();

  const stations = await prisma.station.findMany({
    where: { gameId: id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/teacher/classes/${game.classRoomId}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← กลับไปที่ห้องเรียน {game.classRoom.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{game.title}</h1>
      </div>

      <GameSettingsForm
        gameId={game.id}
        initialTitle={game.title}
        initialDescription={game.description || ""}
        initialPublished={game.published}
        stationCount={stations.length}
      />

      <StationManager
        gameId={game.id}
        gameType={game.type}
        initialStations={stations.map((s) => ({
          ...s,
          config: s.config as Record<string, unknown>,
          quizOptions: s.quizOptions as string[] | null,
        }))}
      />
    </div>
  );
}

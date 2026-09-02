import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOwnedGame } from "@/lib/game-access";
import { prisma } from "@/lib/prisma";

export default async function GameResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const game = await getOwnedGame(id, session!.user.id);
  if (!game) notFound();

  const [attempts, stationCount] = await Promise.all([
    prisma.attempt.findMany({
      where: { gameId: id },
      orderBy: [{ score: "desc" }, { completedAt: "asc" }],
      include: { student: { select: { name: true, email: true } } },
    }),
    prisma.station.count({ where: { gameId: id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/teacher/games/${id}/edit`} className="text-sm text-candypink hover:underline">
          ← กลับไปแก้ไขเกม
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-white">ผลคะแนน: {game.title}</h1>
        <p className="mt-1 text-sm text-slate-400">
          มีทั้งหมด {stationCount} ด่าน · เล่นแล้ว {attempts.length} คน
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">นักเรียน</th>
              <th className="px-4 py-2">คะแนน</th>
              <th className="px-4 py-2">ความคืบหน้า</th>
              <th className="px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {attempts.map((a) => {
              const progressCount = Object.keys((a.stationsProgress as object) || {}).length;
              return (
                <tr key={a.id}>
                  <td className="px-4 py-2">
                    <p className="font-medium text-slate-100">{a.student.name}</p>
                    <p className="text-xs text-slate-500">{a.student.email}</p>
                  </td>
                  <td className="px-4 py-2 font-bold text-candypink">{a.score}</td>
                  <td className="px-4 py-2 text-slate-400">
                    {progressCount}/{stationCount} ด่าน
                  </td>
                  <td className="px-4 py-2">
                    {a.completedAt ? (
                      <span className="badge bg-candygreen/20 text-candygreen">เล่นจบแล้ว</span>
                    ) : (
                      <span className="badge bg-candyyellow/20 text-candyyellow">กำลังเล่น</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  ยังไม่มีนักเรียนเล่นเกมนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

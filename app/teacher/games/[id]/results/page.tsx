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
        <Link href={`/teacher/games/${id}/edit`} className="text-sm text-indigo-600 hover:underline">
          ← กลับไปแก้ไขเกม
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">ผลคะแนน: {game.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          มีทั้งหมด {stationCount} ด่าน · เล่นแล้ว {attempts.length} คน
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">นักเรียน</th>
              <th className="px-4 py-2">คะแนน</th>
              <th className="px-4 py-2">ความคืบหน้า</th>
              <th className="px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attempts.map((a) => {
              const progressCount = Object.keys((a.stationsProgress as object) || {}).length;
              return (
                <tr key={a.id}>
                  <td className="px-4 py-2">
                    <p className="font-medium text-slate-900">{a.student.name}</p>
                    <p className="text-xs text-slate-400">{a.student.email}</p>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-900">{a.score}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {progressCount}/{stationCount} ด่าน
                  </td>
                  <td className="px-4 py-2">
                    {a.completedAt ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        เล่นจบแล้ว
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        กำลังเล่น
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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

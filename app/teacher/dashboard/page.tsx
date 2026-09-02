import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboardPage() {
  const session = await auth();
  const teacherId = session!.user.id;

  const [classCount, games, studentCount] = await Promise.all([
    prisma.classRoom.count({ where: { teacherId } }),
    prisma.game.findMany({
      where: { classRoom: { teacherId } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { classRoom: true, _count: { select: { attempts: true } } },
    }),
    prisma.classMembership.count({ where: { classRoom: { teacherId } } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ด</h1>
        <p className="mt-1 text-sm text-slate-500">ภาพรวมห้องเรียนและเกม AR ของคุณ</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">ห้องเรียนทั้งหมด</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{classCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">นักเรียนทั้งหมด</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{studentCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">เกมล่าสุด</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{games.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">เกมล่าสุด</h2>
        <Link href="/teacher/classes" className="text-sm font-medium text-indigo-600 hover:underline">
          จัดการห้องเรียน →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/teacher/games/${game.id}/edit`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300"
          >
            <p className="font-semibold text-slate-900">{game.title}</p>
            <p className="mt-1 text-sm text-slate-500">{game.classRoom.name}</p>
            <p className="mt-1 text-xs text-slate-400">เล่นแล้ว {game._count.attempts} ครั้ง</p>
          </Link>
        ))}
        {games.length === 0 && (
          <p className="text-sm text-slate-400">
            ยังไม่มีเกม เริ่มจาก{" "}
            <Link href="/teacher/classes" className="text-indigo-600 hover:underline">
              สร้างห้องเรียน
            </Link>{" "}
            แล้วสร้างเกมแรกของคุณ
          </p>
        )}
      </div>
    </div>
  );
}

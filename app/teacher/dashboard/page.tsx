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
        <h1 className="text-2xl font-extrabold text-white">แดชบอร์ด</h1>
        <p className="mt-1 text-sm text-slate-400">ภาพรวมห้องเรียนและเกม AR ของคุณ</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-400">ห้องเรียนทั้งหมด</p>
          <p className="mt-1 text-3xl font-extrabold text-candypink">{classCount}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-400">นักเรียนทั้งหมด</p>
          <p className="mt-1 text-3xl font-extrabold text-candyblue">{studentCount}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-400">เกมล่าสุด</p>
          <p className="mt-1 text-3xl font-extrabold text-candypurple">{games.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">เกมล่าสุด</h2>
        <Link href="/teacher/classes" className="text-sm font-semibold text-candypink hover:underline">
          จัดการห้องเรียน →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/teacher/games/${game.id}/edit`}
            className="glass-card p-4 transition hover:border-candypurple/50"
          >
            <p className="font-semibold text-slate-100">{game.title}</p>
            <p className="mt-1 text-sm text-slate-400">{game.classRoom.name}</p>
            <p className="mt-1 text-xs text-slate-500">เล่นแล้ว {game._count.attempts} ครั้ง</p>
          </Link>
        ))}
        {games.length === 0 && (
          <p className="text-sm text-slate-500">
            ยังไม่มีเกม เริ่มจาก{" "}
            <Link href="/teacher/classes" className="text-candypink hover:underline">
              สร้างห้องเรียน
            </Link>{" "}
            แล้วสร้างเกมแรกของคุณ
          </p>
        )}
      </div>
    </div>
  );
}

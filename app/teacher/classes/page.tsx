import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateClassForm } from "@/components/teacher/CreateClassForm";

export default async function TeacherClassesPage() {
  const session = await auth();
  const classes = await prisma.classRoom.findMany({
    where: { teacherId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { members: true, games: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">ห้องเรียน</h1>
        <p className="mt-1 text-sm text-slate-400">สร้างห้องเรียนเพื่อแจกโค้ดให้นักเรียนเข้าร่วม</p>
      </div>

      <div className="glass-card p-5">
        <CreateClassForm />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Link
            key={c.id}
            href={`/teacher/classes/${c.id}`}
            className="glass-card p-5 transition hover:border-candypurple/50"
          >
            <p className="text-lg font-bold text-slate-100">{c.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              นักเรียน {c._count.members} คน · เกม {c._count.games} เกม
            </p>
            <p className="mt-3 inline-block rounded-md bg-candypink/15 px-2 py-1 font-mono text-sm font-bold text-candypink">
              {c.joinCode}
            </p>
          </Link>
        ))}
        {classes.length === 0 && (
          <p className="text-sm text-slate-500">ยังไม่มีห้องเรียน สร้างห้องแรกของคุณด้านบน</p>
        )}
      </div>
    </div>
  );
}

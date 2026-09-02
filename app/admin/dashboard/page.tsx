import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [teacherCount, studentCount, classCount, gameCount, attemptCount] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.classRoom.count(),
    prisma.game.count(),
    prisma.attempt.count(),
  ]);

  const stats = [
    { label: "ครู", value: teacherCount, color: "text-candypink" },
    { label: "นักเรียน", value: studentCount, color: "text-candyblue" },
    { label: "ห้องเรียน", value: classCount, color: "text-candypurple" },
    { label: "เกมทั้งหมด", value: gameCount, color: "text-candyyellow" },
    { label: "จำนวนครั้งที่เล่น", value: attemptCount, color: "text-candygreen" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="mt-1 text-sm text-slate-400">ภาพรวมทั้งระบบ ARGame</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/admin/users" className="btn-primary">
          จัดการผู้ใช้งาน
        </Link>
        <Link href="/admin/classes" className="btn-secondary">
          ดูห้องเรียนทั้งหมด
        </Link>
      </div>
    </div>
  );
}

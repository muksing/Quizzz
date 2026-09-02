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
    { label: "ครู", value: teacherCount },
    { label: "นักเรียน", value: studentCount },
    { label: "ห้องเรียน", value: classCount },
    { label: "เกมทั้งหมด", value: gameCount },
    { label: "จำนวนครั้งที่เล่น", value: attemptCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="mt-1 text-sm text-slate-500">ภาพรวมทั้งระบบ ARGame</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/users"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          จัดการผู้ใช้งาน
        </Link>
        <Link
          href="/admin/classes"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ดูห้องเรียนทั้งหมด
        </Link>
      </div>
    </div>
  );
}

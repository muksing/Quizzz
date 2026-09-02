import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminClassesPage() {
  const classes = await prisma.classRoom.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { select: { name: true, email: true } },
      _count: { select: { members: true, games: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">ห้องเรียนทั้งหมด</h1>
        <p className="mt-1 text-sm text-slate-400">ทั้งหมด {classes.length} ห้องเรียน จากทุกครู</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">ห้องเรียน</th>
              <th className="px-4 py-2">ครูผู้สอน</th>
              <th className="px-4 py-2">นักเรียน</th>
              <th className="px-4 py-2">เกม</th>
              <th className="px-4 py-2">โค้ด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {classes.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2">
                  <Link href={`/admin/classes/${c.id}`} className="font-semibold text-candypink hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {c.teacher.name}
                  <p className="text-xs text-slate-500">{c.teacher.email}</p>
                </td>
                <td className="px-4 py-2 text-slate-400">{c._count.members}</td>
                <td className="px-4 py-2 text-slate-400">{c._count.games}</td>
                <td className="px-4 py-2 font-mono text-xs text-slate-400">{c.joinCode}</td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  ยังไม่มีห้องเรียนในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

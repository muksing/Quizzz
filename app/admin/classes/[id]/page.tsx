import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  MARKER: "Marker",
  LOCATION: "Location (GPS)",
  IMAGE_TARGET: "Image Target",
  FACE_FILTER: "Face Filter",
};

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const classRoom = await prisma.classRoom.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true, email: true } },
      games: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { stations: true, attempts: true } } },
      },
      members: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!classRoom) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/classes" className="text-sm text-indigo-600 hover:underline">
          ← กลับไปที่ห้องเรียนทั้งหมด
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{classRoom.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          ครูผู้สอน: {classRoom.teacher.name} ({classRoom.teacher.email}) · โค้ด{" "}
          <span className="font-mono">{classRoom.joinCode}</span>
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">เกม</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {classRoom.games.map((game) => (
            <div key={game.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{game.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    game.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {game.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {TYPE_LABEL[game.type]} · {game._count.stations} ด่าน · เล่นแล้ว {game._count.attempts} ครั้ง
              </p>
            </div>
          ))}
          {classRoom.games.length === 0 && <p className="text-sm text-slate-400">ยังไม่มีเกมในห้องนี้</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">นักเรียนในห้อง ({classRoom.members.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">ชื่อ</th>
                <th className="px-4 py-2">อีเมล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classRoom.members.map((m, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{m.user.name}</td>
                  <td className="px-4 py-2 text-slate-500">{m.user.email}</td>
                </tr>
              ))}
              {classRoom.members.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-slate-400">
                    ยังไม่มีนักเรียนเข้าร่วม
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

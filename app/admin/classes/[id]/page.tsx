import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  MARKER: "Marker",
  LOCATION: "Location (GPS)",
  IMAGE_TARGET: "Image Target",
  FACE_FILTER: "Face Filter",
  GESTURE: "Gesture Activity",
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
        <Link href="/admin/classes" className="text-sm text-candypink hover:underline">
          ← กลับไปที่ห้องเรียนทั้งหมด
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-white">{classRoom.name}</h1>
        <p className="mt-1 text-sm text-slate-400">
          ครูผู้สอน: {classRoom.teacher.name} ({classRoom.teacher.email}) · โค้ด{" "}
          <span className="font-mono">{classRoom.joinCode}</span>
        </p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-white">เกม</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {classRoom.games.map((game) => (
            <div key={game.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-100">{game.title}</p>
                <span
                  className={`badge ${
                    game.published ? "bg-candygreen/20 text-candygreen" : "bg-slate-700/50 text-slate-400"
                  }`}
                >
                  {game.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {TYPE_LABEL[game.type]} · {game._count.stations} ด่าน · เล่นแล้ว {game._count.attempts} ครั้ง
              </p>
            </div>
          ))}
          {classRoom.games.length === 0 && <p className="text-sm text-slate-500">ยังไม่มีเกมในห้องนี้</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">นักเรียนในห้อง ({classRoom.members.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-slate-900 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">ชื่อ</th>
                <th className="px-4 py-2">อีเมล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {classRoom.members.map((m, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-slate-200">{m.user.name}</td>
                  <td className="px-4 py-2 text-slate-400">{m.user.email}</td>
                </tr>
              ))}
              {classRoom.members.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-slate-500">
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

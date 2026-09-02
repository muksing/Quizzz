import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateGameForm } from "@/components/teacher/CreateGameForm";

const TYPE_LABEL: Record<string, string> = {
  MARKER: "Marker",
  LOCATION: "Location (GPS)",
  IMAGE_TARGET: "Image Target",
  FACE_FILTER: "Face Filter",
};

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const classRoom = await prisma.classRoom.findUnique({
    where: { id },
    include: {
      games: { orderBy: { createdAt: "desc" }, include: { _count: { select: { stations: true, attempts: true } } } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!classRoom || classRoom.teacherId !== session!.user.id) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{classRoom.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            นักเรียน {classRoom.members.length} คน · เกม {classRoom.games.length} เกม
          </p>
        </div>
        <div className="rounded-xl border border-candypink/30 bg-candypink/10 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-candypink">โค้ดเข้าร่วมห้องเรียน</p>
          <p className="text-2xl font-extrabold tracking-widest text-candypink">{classRoom.joinCode}</p>
        </div>
      </div>

      <section className="glass-card p-5">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-candypink">
            + สร้างเกมใหม่ในห้องนี้
          </summary>
          <div className="mt-4">
            <CreateGameForm classRoomId={classRoom.id} />
          </div>
        </details>
      </section>

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
              <div className="mt-3 flex gap-2">
                <Link href={`/teacher/games/${game.id}/edit`} className="btn-secondary px-3 py-1.5 text-sm">
                  แก้ไข
                </Link>
                <Link href={`/teacher/games/${game.id}/results`} className="btn-secondary px-3 py-1.5 text-sm">
                  ผลคะแนน
                </Link>
              </div>
            </div>
          ))}
          {classRoom.games.length === 0 && <p className="text-sm text-slate-500">ยังไม่มีเกมในห้องนี้</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">นักเรียนในห้อง</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-slate-900 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">ชื่อ</th>
                <th className="px-4 py-2">อีเมล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {classRoom.members.map((m) => (
                <tr key={m.id}>
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

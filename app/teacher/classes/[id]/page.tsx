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
          <h1 className="text-2xl font-bold text-slate-900">{classRoom.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            นักเรียน {classRoom.members.length} คน · เกม {classRoom.games.length} เกม
          </p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center">
          <p className="text-xs font-medium text-indigo-600">โค้ดเข้าร่วมห้องเรียน</p>
          <p className="text-2xl font-bold tracking-widest text-indigo-700">{classRoom.joinCode}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-indigo-600">
            + สร้างเกมใหม่ในห้องนี้
          </summary>
          <div className="mt-4">
            <CreateGameForm classRoomId={classRoom.id} />
          </div>
        </details>
      </section>

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
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/teacher/games/${game.id}/edit`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  แก้ไข
                </Link>
                <Link
                  href={`/teacher/games/${game.id}/results`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  ผลคะแนน
                </Link>
              </div>
            </div>
          ))}
          {classRoom.games.length === 0 && (
            <p className="text-sm text-slate-400">ยังไม่มีเกมในห้องนี้</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">นักเรียนในห้อง</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">ชื่อ</th>
                <th className="px-4 py-2">อีเมล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classRoom.members.map((m) => (
                <tr key={m.id}>
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

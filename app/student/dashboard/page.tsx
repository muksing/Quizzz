import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  MARKER: "Marker",
  LOCATION: "Location (GPS)",
  IMAGE_TARGET: "Image Target",
  FACE_FILTER: "Face Filter",
};

export default async function StudentDashboardPage() {
  const session = await auth();
  const studentId = session!.user.id;

  const memberships = await prisma.classMembership.findMany({
    where: { userId: studentId },
    include: {
      classRoom: {
        include: {
          games: {
            where: { published: true },
            orderBy: { createdAt: "desc" },
            include: { attempts: { where: { studentId } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">ห้องเรียนของฉัน</h1>
          <p className="mt-1 text-sm text-slate-400">เลือกเกม AR ที่ต้องการเล่น</p>
        </div>
        <Link href="/student/join" className="btn-primary">
          + เข้าร่วมห้องเรียน
        </Link>
      </div>

      {memberships.map((m) => (
        <section key={m.id}>
          <h2 className="text-lg font-bold text-white">{m.classRoom.name}</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {m.classRoom.games.map((game) => {
              const attempt = game.attempts[0];
              return (
                <Link
                  key={game.id}
                  href={`/play/${game.id}`}
                  className="glass-card p-4 transition hover:border-candyblue/50"
                >
                  <p className="font-semibold text-slate-100">{game.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{TYPE_LABEL[game.type]}</p>
                  {attempt?.completedAt ? (
                    <p className="badge mt-2 inline-block bg-candygreen/20 text-candygreen">
                      เล่นจบแล้ว · คะแนน {attempt.score}
                    </p>
                  ) : attempt ? (
                    <p className="badge mt-2 inline-block bg-candyyellow/20 text-candyyellow">เล่นค้างอยู่</p>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-candyblue">เริ่มเล่น →</p>
                  )}
                </Link>
              );
            })}
            {m.classRoom.games.length === 0 && (
              <p className="text-sm text-slate-500">ยังไม่มีเกมที่เผยแพร่ในห้องนี้</p>
            )}
          </div>
        </section>
      ))}

      {memberships.length === 0 && (
        <p className="text-sm text-slate-500">
          คุณยังไม่ได้เข้าร่วมห้องเรียนใด กด &quot;เข้าร่วมห้องเรียน&quot; ด้านบนแล้วกรอกโค้ดจากครู
        </p>
      )}
    </div>
  );
}

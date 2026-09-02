import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const destination =
      session.user.role === "ADMIN"
        ? "/admin/dashboard"
        : session.user.role === "TEACHER"
        ? "/teacher/dashboard"
        : "/student/dashboard";
    redirect(destination);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-candypink">ARGame</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-candypink via-candypurple to-candyblue sm:text-5xl">
          สร้างเกม AR สำหรับห้องเรียน เปิดกล้องเล่นได้ทันที
        </h1>
        <p className="mt-6 text-lg text-slate-300">
          ครูออกแบบเกม AR ได้หลากหลายรูปแบบ — สแกนมาร์กเกอร์ ล่าสมบัติตามพิกัด GPS
          สแกนภาพเพื่อดูโมเดล 3D หรือฟิลเตอร์ใบหน้า แล้วให้นักเรียนเข้าเล่นผ่านกล้องมือถือ
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register" className="btn-primary w-full text-base sm:w-auto">
            เริ่มต้นใช้งาน
          </Link>
          <Link href="/login" className="btn-secondary w-full text-base sm:w-auto">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>

      <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Marker", desc: "สแกนมาร์กเกอร์/QR โชว์เนื้อหา" },
          { title: "Location (GPS)", desc: "ล่าสมบัติตามพิกัดจริง" },
          { title: "Image Target", desc: "สแกนภาพ/หนังสือดูโมเดล 3D" },
          { title: "Face Filter", desc: "ฟิลเตอร์ AR บนใบหน้า" },
        ].map((item) => (
          <div key={item.title} className="glass-card p-4 text-left">
            <p className="font-semibold text-slate-100">{item.title}</p>
            <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

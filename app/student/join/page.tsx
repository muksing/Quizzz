import { JoinClassForm } from "@/components/student/JoinClassForm";

export default function JoinClassPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-extrabold text-white">เข้าร่วมห้องเรียน</h1>
      <p className="mt-1 text-sm text-slate-400">ขอโค้ดเข้าร่วมจากครูผู้สอนของคุณ</p>
      <div className="glass-card mt-6 p-6">
        <JoinClassForm />
      </div>
    </div>
  );
}

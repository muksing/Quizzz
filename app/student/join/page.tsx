import { JoinClassForm } from "@/components/student/JoinClassForm";

export default function JoinClassPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-slate-900">เข้าร่วมห้องเรียน</h1>
      <p className="mt-1 text-sm text-slate-500">ขอโค้ดเข้าร่วมจากครูผู้สอนของคุณ</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <JoinClassForm />
      </div>
    </div>
  );
}

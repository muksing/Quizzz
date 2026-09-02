"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TEACHER" | "STUDENT">("TEACHER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="glass-card w-full max-w-sm p-8">
        <h1 className="text-xl font-extrabold text-white">สมัครสมาชิก</h1>
        <p className="mt-1 text-sm text-slate-400">สร้างบัญชีเพื่อเริ่มใช้งาน ARGame</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label-field">บทบาท</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  role === "TEACHER"
                    ? "border-candypurple bg-candypurple/20 text-candypurple"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                ครู
              </button>
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  role === "STUDENT"
                    ? "border-candypurple bg-candypurple/20 text-candypurple"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                นักเรียน
              </button>
            </div>
          </div>

          <div>
            <label className="label-field">ชื่อ</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">รหัสผ่าน</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <p className="mt-1 text-xs text-slate-500">อย่างน้อย 8 ตัวอักษร</p>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-semibold text-candypink hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinClassForm() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/classes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "เข้าร่วมห้องเรียนไม่สำเร็จ");
      return;
    }

    setSuccess(`เข้าร่วมห้องเรียน "${data.classRoom.name}" สำเร็จ!`);
    setJoinCode("");
    router.refresh();
    setTimeout(() => router.push("/student/dashboard"), 800);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label-field">โค้ดเข้าร่วมห้องเรียน</label>
        <input
          required
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="เช่น AB12CD"
          className="input-field text-center font-mono text-lg tracking-widest"
        />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {success && <p className="text-sm text-candygreen">{success}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "กำลังเข้าร่วม..." : "เข้าร่วมห้องเรียน"}
      </button>
    </form>
  );
}

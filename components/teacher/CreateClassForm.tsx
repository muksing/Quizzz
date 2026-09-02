"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "สร้างห้องเรียนไม่สำเร็จ");
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label-field">ชื่อห้องเรียนใหม่</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น ม.2/1 วิทยาศาสตร์"
          className="input-field"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "กำลังสร้าง..." : "สร้างห้องเรียน"}
      </button>
      {error && <p className="text-sm text-rose-400 sm:ml-3">{error}</p>}
    </form>
  );
}

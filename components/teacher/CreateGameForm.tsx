"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GAME_TYPES: { value: string; label: string; desc: string }[] = [
  { value: "MARKER", label: "Marker", desc: "สแกนมาร์กเกอร์/บาร์โค้ด" },
  { value: "LOCATION", label: "Location (GPS)", desc: "ล่าสมบัติตามพิกัด" },
  { value: "IMAGE_TARGET", label: "Image Target", desc: "สแกนภาพ/หนังสือ" },
  { value: "FACE_FILTER", label: "Face Filter", desc: "ฟิลเตอร์บนใบหน้า" },
];

export function CreateGameForm({ classRoomId }: { classRoomId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("MARKER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classRoomId, title, type }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "สร้างเกมไม่สำเร็จ");
      return;
    }

    router.push(`/teacher/games/${data.game.id}/edit`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">ชื่อเกม</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ล่าสมบัติในห้องสมุด"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">รูปแบบ AR</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {GAME_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                type === t.value
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold text-slate-900">{t.label}</p>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? "กำลังสร้าง..." : "สร้างเกมและไปที่ตัวแก้ไข"}
      </button>
    </form>
  );
}

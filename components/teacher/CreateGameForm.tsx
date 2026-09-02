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
        <label className="label-field">ชื่อเกม</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ล่าสมบัติในห้องสมุด"
          className="input-field"
        />
      </div>

      <div>
        <label className="label-field">รูปแบบ AR</label>
        <div className="grid grid-cols-2 gap-2">
          {GAME_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                type === t.value
                  ? "border-candypurple bg-candypurple/15"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <p className="font-semibold text-slate-100">{t.label}</p>
              <p className="text-xs text-slate-400">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "กำลังสร้าง..." : "สร้างเกมและไปที่ตัวแก้ไข"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GameSettingsForm({
  gameId,
  initialTitle,
  initialDescription,
  initialPublished,
  stationCount,
}: {
  gameId: string;
  initialTitle: string;
  initialDescription: string;
  initialPublished: boolean;
  stationCount: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [published, setPublished] = useState(initialPublished);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: { title?: string; description?: string; published?: boolean }) {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/games/${gameId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "บันทึกไม่สำเร็จ");
      return;
    }

    router.refresh();
  }

  return (
    <div className="glass-card p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">ชื่อเกม</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== initialTitle && save({ title })}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">คำอธิบาย</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== initialDescription && save({ description })}
            className="input-field"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-sm font-semibold text-slate-200">เผยแพร่เกม</p>
          <p className="text-xs text-slate-500">
            {stationCount === 0
              ? "ต้องมีอย่างน้อย 1 ด่านก่อนเผยแพร่"
              : "นักเรียนในห้องจะเห็นและเล่นเกมนี้ได้เมื่อเผยแพร่"}
          </p>
        </div>
        <button
          disabled={saving || (!published && stationCount === 0)}
          onClick={() => {
            const next = !published;
            setPublished(next);
            save({ published: next });
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition disabled:opacity-50 ${
            published ? "bg-candygreen text-slate-950" : "bg-slate-700 text-slate-300"
          }`}
        >
          {published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}

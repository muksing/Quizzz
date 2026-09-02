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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">ชื่อเกม</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== initialTitle && save({ title })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">คำอธิบาย</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== initialDescription && save({ description })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-medium text-slate-700">เผยแพร่เกม</p>
          <p className="text-xs text-slate-400">
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
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
            published ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
          }`}
        >
          {published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

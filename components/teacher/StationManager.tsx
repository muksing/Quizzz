"use client";

import { useState } from "react";
import { StationForm, StationFormValue, StationDTO } from "./StationForm";

type GameType = "MARKER" | "LOCATION" | "IMAGE_TARGET" | "FACE_FILTER";

const CONTENT_LABEL: Record<string, string> = {
  MODEL_3D: "โมเดล 3D",
  IMAGE: "รูปภาพ",
  TEXT: "ข้อความ",
  QUIZ: "คำถาม",
};

function toFormValue(s: StationDTO): StationFormValue {
  return {
    id: s.id,
    title: s.title,
    config: s.config,
    contentType: s.contentType,
    contentUrl: s.contentUrl || "",
    textContent: s.textContent || "",
    quizQuestion: s.quizQuestion || "",
    quizOptions: s.quizOptions && s.quizOptions.length > 0 ? s.quizOptions : ["", ""],
    correctOptionIndex: s.correctOptionIndex ?? 0,
  };
}

export function StationManager({
  gameId,
  gameType,
  initialStations,
}: {
  gameId: string;
  gameType: GameType;
  initialStations: StationDTO[];
}) {
  const [stations, setStations] = useState<StationDTO[]>(initialStations);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  function handleSaved(station: StationDTO) {
    setStations((prev) => {
      const exists = prev.some((s) => s.id === station.id);
      const next = exists ? prev.map((s) => (s.id === station.id ? station : s)) : [...prev, station];
      return next.sort((a, b) => a.order - b.order);
    });
    setEditingId(null);
  }

  async function handleDelete(stationId: string) {
    if (!confirm("ลบด่านนี้?")) return;
    const res = await fetch(`/api/games/${gameId}/stations/${stationId}`, { method: "DELETE" });
    if (res.ok) {
      setStations((prev) => prev.filter((s) => s.id !== stationId));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">ด่าน ({stations.length})</h2>
        {editingId === null && (
          <button
            onClick={() => setEditingId("new")}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            + เพิ่มด่าน
          </button>
        )}
      </div>

      {editingId === "new" && (
        <StationForm
          gameId={gameId}
          gameType={gameType}
          onSaved={handleSaved}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div className="space-y-3">
        {stations.map((station, index) =>
          editingId === station.id ? (
            <StationForm
              key={station.id}
              gameId={gameId}
              gameType={gameType}
              initial={toFormValue(station)}
              onSaved={handleSaved}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={station.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold text-indigo-600">ด่านที่ {index + 1}</p>
                <p className="font-medium text-slate-900">{station.title}</p>
                <p className="text-xs text-slate-400">เนื้อหา: {CONTENT_LABEL[station.contentType]}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(station.id)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(station.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  ลบ
                </button>
              </div>
            </div>
          )
        )}
        {stations.length === 0 && editingId !== "new" && (
          <p className="text-sm text-slate-400">ยังไม่มีด่าน กด &quot;เพิ่มด่าน&quot; เพื่อเริ่มสร้าง</p>
        )}
      </div>
    </div>
  );
}

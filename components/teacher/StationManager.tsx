"use client";

import { useState } from "react";
import { StationForm, StationFormValue, StationDTO } from "./StationForm";

type GameType = "MARKER" | "LOCATION" | "IMAGE_TARGET" | "FACE_FILTER" | "GESTURE";

const CONTENT_LABEL: Record<string, string> = {
  MODEL_3D: "โมเดล 3D",
  IMAGE: "รูปภาพ",
  TEXT: "ข้อความ",
  QUIZ: "คำถาม",
  MATCHING: "จับคู่",
  GROUPING: "จัดกลุ่ม",
  ORDERING: "เรียงลำดับ",
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
    activityData: s.activityData || {},
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
        <h2 className="text-lg font-bold text-white">ด่าน ({stations.length})</h2>
        {editingId === null && (
          <button onClick={() => setEditingId("new")} className="btn-primary px-3 py-1.5 text-sm">
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
            <div key={station.id} className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-bold text-candypink">ด่านที่ {index + 1}</p>
                <p className="font-semibold text-slate-100">{station.title}</p>
                <p className="text-xs text-slate-500">เนื้อหา: {CONTENT_LABEL[station.contentType]}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(station.id)} className="btn-secondary px-3 py-1.5 text-sm">
                  แก้ไข
                </button>
                <button onClick={() => handleDelete(station.id)} className="btn-danger px-3 py-1.5 text-sm">
                  ลบ
                </button>
              </div>
            </div>
          )
        )}
        {stations.length === 0 && editingId !== "new" && (
          <p className="text-sm text-slate-500">ยังไม่มีด่าน กด &quot;เพิ่มด่าน&quot; เพื่อเริ่มสร้าง</p>
        )}
      </div>
    </div>
  );
}

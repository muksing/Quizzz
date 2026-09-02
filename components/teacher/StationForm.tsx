"use client";

import { useState } from "react";
import { FileUploadField } from "./FileUploadField";
import { FACE_ANCHORS, MARKER_PRESET_IMAGES } from "@/lib/ar-config";

type GameType = "MARKER" | "LOCATION" | "IMAGE_TARGET" | "FACE_FILTER";
type ContentType = "MODEL_3D" | "IMAGE" | "TEXT" | "QUIZ";

export type StationDTO = {
  id: string;
  order: number;
  title: string;
  config: Record<string, unknown>;
  contentType: ContentType;
  contentUrl: string | null;
  textContent: string | null;
  quizQuestion: string | null;
  quizOptions: string[] | null;
  correctOptionIndex: number | null;
};

export type StationFormValue = {
  id?: string;
  title: string;
  config: Record<string, unknown>;
  contentType: ContentType;
  contentUrl: string;
  textContent: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
};

const emptyValue = (gameType: GameType): StationFormValue => ({
  title: "",
  config: defaultConfig(gameType),
  contentType: "TEXT",
  contentUrl: "",
  textContent: "",
  quizQuestion: "",
  quizOptions: ["", ""],
  correctOptionIndex: 0,
});

function defaultConfig(gameType: GameType): Record<string, unknown> {
  switch (gameType) {
    case "MARKER":
      return { markerMode: "preset", presetType: "hiro" };
    case "LOCATION":
      return { lat: 13.7563, lng: 100.5018, radiusMeters: 20 };
    case "IMAGE_TARGET":
      return { mindFileUrl: "" };
    case "FACE_FILTER":
      return { anchor: "forehead" };
  }
}

export function StationForm({
  gameId,
  gameType,
  initial,
  onSaved,
  onCancel,
}: {
  gameId: string;
  gameType: GameType;
  initial?: StationFormValue;
  onSaved: (station: StationDTO) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState<StationFormValue>(initial ?? emptyValue(gameType));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateConfig(patch: Record<string, unknown>) {
    setValue((v) => ({ ...v, config: { ...v.config, ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: value.title,
      config: value.config,
      contentType: value.contentType,
      contentUrl: value.contentUrl || undefined,
      textContent: value.contentType === "TEXT" ? value.textContent : undefined,
      quizQuestion: value.contentType === "QUIZ" ? value.quizQuestion : undefined,
      quizOptions: value.contentType === "QUIZ" ? value.quizOptions.filter(Boolean) : undefined,
      correctOptionIndex: value.contentType === "QUIZ" ? value.correctOptionIndex : undefined,
    };

    const url = value.id
      ? `/api/games/${gameId}/stations/${value.id}`
      : `/api/games/${gameId}/stations`;
    const method = value.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "บันทึกไม่สำเร็จ");
      return;
    }

    onSaved(data.station);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">ชื่อด่าน</label>
        <input
          required
          value={value.title}
          onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Position / trigger config, depends on game type */}
      {gameType === "MARKER" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-700">ตำแหน่งมาร์กเกอร์</p>
          <div className="flex gap-2 text-sm">
            {(["preset", "barcode", "pattern"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateConfig({ markerMode: mode })}
                className={`rounded-lg border px-3 py-1.5 ${
                  value.config.markerMode === mode
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {mode === "preset" ? "มาร์กเกอร์สำเร็จรูป" : mode === "barcode" ? "บาร์โค้ด" : "แพทเทิร์นกำหนดเอง"}
              </button>
            ))}
          </div>

          {value.config.markerMode === "preset" && (
            <div>
              <select
                value={(value.config.presetType as string) || "hiro"}
                onChange={(e) => updateConfig({ presetType: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="hiro">Hiro</option>
                <option value="kanji">Kanji</option>
              </select>
              <a
                href={MARKER_PRESET_IMAGES[(value.config.presetType as "hiro" | "kanji") || "hiro"]}
                target="_blank"
                rel="noreferrer"
                className="ml-3 text-sm text-indigo-600 hover:underline"
              >
                ดู/ปริ้นมาร์กเกอร์
              </a>
            </div>
          )}

          {value.config.markerMode === "barcode" && (
            <div>
              <label className="block text-xs text-slate-500">
                เลขบาร์โค้ด (0-99) — แต่ละด่านควรใช้เลขไม่ซ้ำกัน
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={(value.config.barcodeValue as number) ?? 0}
                onChange={(e) => updateConfig({ barcodeValue: Number(e.target.value) })}
                className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-slate-400">
                พิมพ์มาร์กเกอร์บาร์โค้ดจากเครื่องมือสร้างมาร์กเกอร์ของ AR.js แล้วปริ้นให้ตรงเลข
              </p>
            </div>
          )}

          {value.config.markerMode === "pattern" && (
            <FileUploadField
              label="อัปโหลดไฟล์แพทเทิร์น (.patt)"
              accept=".patt"
              value={(value.config.patternUrl as string) || ""}
              onChange={(url) => updateConfig({ patternUrl: url })}
            />
          )}
        </div>
      )}

      {gameType === "LOCATION" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-700">พิกัด GPS</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500">ละติจูด (lat)</label>
              <input
                type="number"
                step="any"
                value={(value.config.lat as number) ?? 0}
                onChange={(e) => updateConfig({ lat: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">ลองจิจูด (lng)</label>
              <input
                type="number"
                step="any"
                value={(value.config.lng as number) ?? 0}
                onChange={(e) => updateConfig({ lng: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500">รัศมีที่ถือว่าถึงจุด (เมตร)</label>
            <input
              type="number"
              min={5}
              value={(value.config.radiusMeters as number) ?? 20}
              onChange={(e) => updateConfig({ radiusMeters: Number(e.target.value) })}
              className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="text-xs text-slate-400">
            เคล็ดลับ: เปิด Google Maps บนมือถือ กดค้างที่ตำแหน่งจริง แล้วคัดลอกพิกัดมาใส่ที่นี่
          </p>
        </div>
      )}

      {gameType === "IMAGE_TARGET" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-700">ภาพเป้าหมาย</p>
          <FileUploadField
            label="อัปโหลดไฟล์ .mind (คอมไพล์จากภาพที่จะให้สแกน)"
            accept=".mind"
            value={(value.config.mindFileUrl as string) || ""}
            onChange={(url) => updateConfig({ mindFileUrl: url })}
          />
          <p className="text-xs text-slate-400">
            ใช้เครื่องมือคอมไพล์ภาพเป็น .mind ที่{" "}
            <a
              href="https://hiukim.github.io/mind-ar-js-doc/tools/compile"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              MindAR Image Target Compiler
            </a>{" "}
            แล้วอัปโหลดไฟล์ที่ได้ที่นี่
          </p>
        </div>
      )}

      {gameType === "FACE_FILTER" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-700">ตำแหน่งบนใบหน้า</p>
          <select
            value={(value.config.anchor as string) || "forehead"}
            onChange={(e) => updateConfig({ anchor: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.keys(FACE_ANCHORS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content shown at this station */}
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-700">เนื้อหาที่จะแสดง</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {(["TEXT", "IMAGE", "MODEL_3D", "QUIZ"] as ContentType[]).map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => setValue((v) => ({ ...v, contentType: ct }))}
              className={`rounded-lg border px-3 py-1.5 ${
                value.contentType === ct
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              {ct === "TEXT" ? "ข้อความ" : ct === "IMAGE" ? "รูปภาพ" : ct === "MODEL_3D" ? "โมเดล 3D" : "คำถาม"}
            </button>
          ))}
        </div>

        {value.contentType === "TEXT" && (
          <textarea
            value={value.textContent}
            onChange={(e) => setValue((v) => ({ ...v, textContent: e.target.value }))}
            placeholder="ข้อความที่จะลอยขึ้นมาบนกล้อง"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}

        {value.contentType === "IMAGE" && (
          <FileUploadField
            label="อัปโหลดรูปภาพ"
            accept="image/*"
            value={value.contentUrl}
            onChange={(url) => setValue((v) => ({ ...v, contentUrl: url }))}
          />
        )}

        {value.contentType === "MODEL_3D" && (
          <FileUploadField
            label="อัปโหลดโมเดล 3D (.glb)"
            accept=".glb"
            value={value.contentUrl}
            onChange={(url) => setValue((v) => ({ ...v, contentUrl: url }))}
          />
        )}

        {value.contentType === "QUIZ" && (
          <div className="space-y-2">
            <input
              value={value.quizQuestion}
              onChange={(e) => setValue((v) => ({ ...v, quizQuestion: e.target.value }))}
              placeholder="คำถาม"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {value.quizOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={value.correctOptionIndex === i}
                  onChange={() => setValue((v) => ({ ...v, correctOptionIndex: i }))}
                />
                <input
                  value={opt}
                  onChange={(e) =>
                    setValue((v) => ({
                      ...v,
                      quizOptions: v.quizOptions.map((o, idx) => (idx === i ? e.target.value : o)),
                    }))
                  }
                  placeholder={`ตัวเลือกที่ ${i + 1}`}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            ))}
            {value.quizOptions.length < 6 && (
              <button
                type="button"
                onClick={() => setValue((v) => ({ ...v, quizOptions: [...v.quizOptions, ""] }))}
                className="text-sm text-indigo-600 hover:underline"
              >
                + เพิ่มตัวเลือก
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกด่าน"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

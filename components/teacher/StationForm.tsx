"use client";

import { useState } from "react";
import { FileUploadField } from "./FileUploadField";
import { FACE_ANCHORS, MARKER_PRESET_IMAGES } from "@/lib/ar-config";
import type { MatchingData, GroupingData, OrderingData } from "@/lib/gesture-config";

type GameType = "MARKER" | "LOCATION" | "IMAGE_TARGET" | "FACE_FILTER" | "GESTURE";
type ContentType = "MODEL_3D" | "IMAGE" | "TEXT" | "QUIZ" | "MATCHING" | "GROUPING" | "ORDERING";

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
  activityData?: Record<string, unknown> | null;
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
  activityData: Record<string, unknown>;
};

const MAX_GESTURE_OPTIONS = 4;

const emptyValue = (gameType: GameType): StationFormValue => ({
  title: "",
  config: defaultConfig(gameType),
  contentType: gameType === "GESTURE" ? "QUIZ" : "TEXT",
  contentUrl: "",
  textContent: "",
  quizQuestion: "",
  quizOptions: ["", ""],
  correctOptionIndex: 0,
  activityData: defaultActivityData("QUIZ"),
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
    case "GESTURE":
      return {};
  }
}

function defaultActivityData(contentType: ContentType): Record<string, unknown> {
  switch (contentType) {
    case "MATCHING":
      return { pairs: [{ left: "", right: "" }, { left: "", right: "" }] } satisfies MatchingData;
    case "GROUPING":
      return {
        categories: ["", ""],
        items: [{ label: "", categoryIndex: 0 }],
      } satisfies GroupingData;
    case "ORDERING":
      return { items: ["", "", ""] } satisfies OrderingData;
    default:
      return {};
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

  function updateActivityData(patch: Record<string, unknown>) {
    setValue((v) => ({ ...v, activityData: { ...v.activityData, ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const isGestureActivity = ["MATCHING", "GROUPING", "ORDERING"].includes(value.contentType);

    const payload = {
      title: value.title,
      config: value.config,
      contentType: value.contentType,
      contentUrl: value.contentUrl || undefined,
      textContent: value.contentType === "TEXT" ? value.textContent : undefined,
      quizQuestion: value.contentType === "QUIZ" ? value.quizQuestion : undefined,
      quizOptions: value.contentType === "QUIZ" ? value.quizOptions.filter(Boolean) : undefined,
      correctOptionIndex: value.contentType === "QUIZ" ? value.correctOptionIndex : undefined,
      activityData: isGestureActivity ? value.activityData : undefined,
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-candypurple/30 bg-candypurple/10 p-4">
      <div>
        <label className="label-field">ชื่อด่าน</label>
        <input
          required
          value={value.title}
          onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
          className="input-field"
        />
      </div>

      {/* Position / trigger config, depends on game type */}
      {gameType === "MARKER" && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-slate-200">ตำแหน่งมาร์กเกอร์</p>
          <div className="flex gap-2 text-sm">
            {(["preset", "barcode", "pattern"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateConfig({ markerMode: mode })}
                className={`rounded-lg border px-3 py-1.5 ${
                  value.config.markerMode === mode
                    ? "border-candypurple bg-candypurple/20 text-candypurple"
                    : "border-slate-700 text-slate-400"
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
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="hiro">Hiro</option>
                <option value="kanji">Kanji</option>
              </select>
              <a
                href={MARKER_PRESET_IMAGES[(value.config.presetType as "hiro" | "kanji") || "hiro"]}
                target="_blank"
                rel="noreferrer"
                className="ml-3 text-sm text-candypink hover:underline"
              >
                ดู/ปริ้นมาร์กเกอร์
              </a>
            </div>
          )}

          {value.config.markerMode === "barcode" && (
            <div>
              <label className="block text-xs text-slate-400">
                เลขบาร์โค้ด (0-99) — แต่ละด่านควรใช้เลขไม่ซ้ำกัน
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={(value.config.barcodeValue as number) ?? 0}
                onChange={(e) => updateConfig({ barcodeValue: Number(e.target.value) })}
                className="input-field mt-1 w-32"
              />
              <p className="mt-1 text-xs text-slate-500">
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
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-slate-200">พิกัด GPS</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400">ละติจูด (lat)</label>
              <input
                type="number"
                step="any"
                value={(value.config.lat as number) ?? 0}
                onChange={(e) => updateConfig({ lat: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">ลองจิจูด (lng)</label>
              <input
                type="number"
                step="any"
                value={(value.config.lng as number) ?? 0}
                onChange={(e) => updateConfig({ lng: Number(e.target.value) })}
                className="input-field mt-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400">รัศมีที่ถือว่าถึงจุด (เมตร)</label>
            <input
              type="number"
              min={5}
              value={(value.config.radiusMeters as number) ?? 20}
              onChange={(e) => updateConfig({ radiusMeters: Number(e.target.value) })}
              className="input-field mt-1 w-32"
            />
          </div>
          <p className="text-xs text-slate-500">
            เคล็ดลับ: เปิด Google Maps บนมือถือ กดค้างที่ตำแหน่งจริง แล้วคัดลอกพิกัดมาใส่ที่นี่
          </p>
        </div>
      )}

      {gameType === "IMAGE_TARGET" && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-slate-200">ภาพเป้าหมาย</p>
          <FileUploadField
            label="อัปโหลดไฟล์ .mind (คอมไพล์จากภาพที่จะให้สแกน)"
            accept=".mind"
            value={(value.config.mindFileUrl as string) || ""}
            onChange={(url) => updateConfig({ mindFileUrl: url })}
          />
          <p className="text-xs text-slate-500">
            ใช้เครื่องมือคอมไพล์ภาพเป็น .mind ที่{" "}
            <a
              href="https://hiukim.github.io/mind-ar-js-doc/tools/compile"
              target="_blank"
              rel="noreferrer"
              className="text-candypink hover:underline"
            >
              MindAR Image Target Compiler
            </a>{" "}
            แล้วอัปโหลดไฟล์ที่ได้ที่นี่
          </p>
        </div>
      )}

      {gameType === "FACE_FILTER" && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-slate-200">ตำแหน่งบนใบหน้า</p>
          <select
            value={(value.config.anchor as string) || "forehead"}
            onChange={(e) => updateConfig({ anchor: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            {Object.keys(FACE_ANCHORS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      )}

      {gameType === "GESTURE" && (
        <p className="rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-slate-400">
          นักเรียนจะเปิดกล้อง แล้วชี้/ยกนิ้วค้างไว้เหนือตัวเลือกบนจอเพื่อเลือกคำตอบ — ไม่ต้องแตะหน้าจอ
        </p>
      )}

      {/* Content shown at this station */}
      {gameType !== "GESTURE" && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-slate-200">เนื้อหาที่จะแสดง</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {(["TEXT", "IMAGE", "MODEL_3D", "QUIZ"] as ContentType[]).map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() => setValue((v) => ({ ...v, contentType: ct }))}
                className={`rounded-lg border px-3 py-1.5 ${
                  value.contentType === ct
                    ? "border-candypurple bg-candypurple/20 text-candypurple"
                    : "border-slate-700 text-slate-400"
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
              className="input-field"
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
            <QuizEditor value={value} setValue={setValue} maxOptions={6} />
          )}
        </div>
      )}

      {gameType === "GESTURE" && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-slate-200">รูปแบบกิจกรรม</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {(["QUIZ", "MATCHING", "GROUPING", "ORDERING"] as ContentType[]).map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() =>
                  setValue((v) => ({ ...v, contentType: ct, activityData: defaultActivityData(ct) }))
                }
                className={`rounded-lg border px-3 py-1.5 ${
                  value.contentType === ct
                    ? "border-candypurple bg-candypurple/20 text-candypurple"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                {ct === "QUIZ"
                  ? "เลือกตอบ"
                  : ct === "MATCHING"
                  ? "จับคู่"
                  : ct === "GROUPING"
                  ? "จัดกลุ่ม"
                  : "เรียงลำดับ"}
              </button>
            ))}
          </div>

          {value.contentType === "QUIZ" && (
            <QuizEditor value={value} setValue={setValue} maxOptions={MAX_GESTURE_OPTIONS} />
          )}
          {value.contentType === "MATCHING" && (
            <MatchingEditor value={value.activityData as MatchingData} onChange={updateActivityData} />
          )}
          {value.contentType === "GROUPING" && (
            <GroupingEditor value={value.activityData as GroupingData} onChange={updateActivityData} />
          )}
          {value.contentType === "ORDERING" && (
            <OrderingEditor value={value.activityData as OrderingData} onChange={updateActivityData} />
          )}
        </div>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "กำลังบันทึก..." : "บันทึกด่าน"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

function QuizEditor({
  value,
  setValue,
  maxOptions,
}: {
  value: StationFormValue;
  setValue: React.Dispatch<React.SetStateAction<StationFormValue>>;
  maxOptions: number;
}) {
  return (
    <div className="space-y-2">
      <input
        value={value.quizQuestion}
        onChange={(e) => setValue((v) => ({ ...v, quizQuestion: e.target.value }))}
        placeholder="คำถาม"
        className="input-field"
      />
      {value.quizOptions.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={value.correctOptionIndex === i}
            onChange={() => setValue((v) => ({ ...v, correctOptionIndex: i }))}
            className="accent-candypink"
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
            className="input-field flex-1"
          />
        </div>
      ))}
      {value.quizOptions.length < maxOptions && (
        <button
          type="button"
          onClick={() => setValue((v) => ({ ...v, quizOptions: [...v.quizOptions, ""] }))}
          className="text-sm text-candypink hover:underline"
        >
          + เพิ่มตัวเลือก
        </button>
      )}
    </div>
  );
}

function MatchingEditor({
  value,
  onChange,
}: {
  value: MatchingData;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const pairs = value?.pairs ?? [];

  function updatePair(i: number, side: "left" | "right", text: string) {
    onChange({ pairs: pairs.map((p, idx) => (idx === i ? { ...p, [side]: text } : p)) });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">จับคู่ซ้าย-ขวา สูงสุด {MAX_GESTURE_OPTIONS} คู่</p>
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={pair.left}
            onChange={(e) => updatePair(i, "left", e.target.value)}
            placeholder={`ซ้าย ${i + 1}`}
            className="input-field flex-1"
          />
          <span className="text-slate-500">↔</span>
          <input
            value={pair.right}
            onChange={(e) => updatePair(i, "right", e.target.value)}
            placeholder={`ขวา ${i + 1}`}
            className="input-field flex-1"
          />
          {pairs.length > 2 && (
            <button
              type="button"
              onClick={() => onChange({ pairs: pairs.filter((_, idx) => idx !== i) })}
              className="text-rose-400 hover:underline"
            >
              ลบ
            </button>
          )}
        </div>
      ))}
      {pairs.length < MAX_GESTURE_OPTIONS && (
        <button
          type="button"
          onClick={() => onChange({ pairs: [...pairs, { left: "", right: "" }] })}
          className="text-sm text-candypink hover:underline"
        >
          + เพิ่มคู่
        </button>
      )}
    </div>
  );
}

function GroupingEditor({
  value,
  onChange,
}: {
  value: GroupingData;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const categories = value?.categories ?? [];
  const items = value?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs text-slate-500">หมวดหมู่ สูงสุด {MAX_GESTURE_OPTIONS} หมวด</p>
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={cat}
              onChange={(e) =>
                onChange({ categories: categories.map((c, idx) => (idx === i ? e.target.value : c)) })
              }
              placeholder={`หมวดที่ ${i + 1}`}
              className="input-field flex-1"
            />
            {categories.length > 2 && (
              <button
                type="button"
                onClick={() => onChange({ categories: categories.filter((_, idx) => idx !== i) })}
                className="text-rose-400 hover:underline"
              >
                ลบ
              </button>
            )}
          </div>
        ))}
        {categories.length < MAX_GESTURE_OPTIONS && (
          <button
            type="button"
            onClick={() => onChange({ categories: [...categories, ""] })}
            className="text-sm text-candypink hover:underline"
          >
            + เพิ่มหมวด
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-500">รายการที่ต้องจัดกลุ่ม</p>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.label}
              onChange={(e) =>
                onChange({ items: items.map((it, idx) => (idx === i ? { ...it, label: e.target.value } : it)) })
              }
              placeholder={`รายการที่ ${i + 1}`}
              className="input-field flex-1"
            />
            <select
              value={item.categoryIndex}
              onChange={(e) =>
                onChange({
                  items: items.map((it, idx) =>
                    idx === i ? { ...it, categoryIndex: Number(e.target.value) } : it
                  ),
                })
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100"
            >
              {categories.map((cat, ci) => (
                <option key={ci} value={ci}>
                  {cat || `หมวดที่ ${ci + 1}`}
                </option>
              ))}
            </select>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) })}
                className="text-rose-400 hover:underline"
              >
                ลบ
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ items: [...items, { label: "", categoryIndex: 0 }] })}
          className="text-sm text-candypink hover:underline"
        >
          + เพิ่มรายการ
        </button>
      </div>
    </div>
  );
}

function OrderingEditor({
  value,
  onChange,
}: {
  value: OrderingData;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const items = value?.items ?? [];

  function move(i: number, dir: -1 | 1) {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ items: next });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        ใส่รายการเรียงตามลำดับที่ถูกต้อง (สูงสุด {MAX_GESTURE_OPTIONS} รายการ) — นักเรียนจะเห็นแบบสลับสุ่ม
      </p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 text-center text-sm font-bold text-candypink">{i + 1}</span>
          <input
            value={item}
            onChange={(e) => onChange({ items: items.map((it, idx) => (idx === i ? e.target.value : it)) })}
            placeholder={`ลำดับที่ ${i + 1}`}
            className="input-field flex-1"
          />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-400 disabled:opacity-30">
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(i, 1)}
            disabled={i === items.length - 1}
            className="text-slate-400 disabled:opacity-30"
          >
            ↓
          </button>
          {items.length > 2 && (
            <button
              type="button"
              onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) })}
              className="text-rose-400 hover:underline"
            >
              ลบ
            </button>
          )}
        </div>
      ))}
      {items.length < MAX_GESTURE_OPTIONS && (
        <button
          type="button"
          onClick={() => onChange({ items: [...items, ""] })}
          className="text-sm text-candypink hover:underline"
        >
          + เพิ่มรายการ
        </button>
      )}
    </div>
  );
}

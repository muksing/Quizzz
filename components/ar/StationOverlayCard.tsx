"use client";

import { useEffect, useState } from "react";
import { loadScript } from "@/lib/load-script";

type ContentType = "MODEL_3D" | "IMAGE" | "TEXT" | "QUIZ";

export function StationOverlayCard({
  title,
  contentType,
  contentUrl,
  textContent,
  quizQuestion,
  quizOptions,
  correctOptionIndex,
  onComplete,
}: {
  title: string;
  contentType: ContentType;
  contentUrl: string | null;
  textContent: string | null;
  quizQuestion: string | null;
  quizOptions: string[] | null;
  correctOptionIndex: number | null;
  onComplete: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (contentType === "MODEL_3D") {
      loadScript("https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js").catch(() => {});
    }
  }, [contentType]);

  return (
    <div className="pointer-events-auto absolute inset-x-4 bottom-6 rounded-2xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">พบแล้ว!</p>
      <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>

      {contentType === "TEXT" && textContent && (
        <p className="mt-3 whitespace-pre-wrap text-slate-700">{textContent}</p>
      )}

      {contentType === "IMAGE" && contentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={contentUrl} alt={title} className="mt-3 max-h-64 w-full rounded-lg object-contain" />
      )}

      {contentType === "MODEL_3D" && contentUrl && (
        <model-viewer
          src={contentUrl}
          camera-controls
          auto-rotate
          style={{ width: "100%", height: "220px", marginTop: "0.75rem" }}
        />
      )}

      {contentType === "QUIZ" && quizQuestion && quizOptions && (
        <div className="mt-3 space-y-2">
          <p className="font-medium text-slate-800">{quizQuestion}</p>
          {quizOptions.map((opt, i) => {
            const isCorrect = i === correctOptionIndex;
            const isSelected = i === selected;
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setSelected(i)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  answered && isSelected
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-500 bg-red-50"
                    : answered && isCorrect
                    ? "border-emerald-500 bg-emerald-50"
                    : isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {contentType === "QUIZ" ? (
          answered ? (
            <button
              onClick={() => onComplete(selected === correctOptionIndex)}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              ไปด่านถัดไป
            </button>
          ) : (
            <button
              disabled={selected === null}
              onClick={() => setAnswered(true)}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              ตอบคำถาม
            </button>
          )
        ) : (
          <button
            onClick={() => onComplete(true)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            ไปด่านถัดไป
          </button>
        )}
      </div>
    </div>
  );
}

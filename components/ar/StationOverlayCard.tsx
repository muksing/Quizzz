"use client";

import { useEffect, useState } from "react";
import { loadScript } from "@/lib/load-script";

type ContentType = "MODEL_3D" | "IMAGE" | "TEXT" | "QUIZ";

const OPTION_STYLES = [
  { border: "border-candypink", badge: "bg-candypink text-white" },
  { border: "border-candypurple", badge: "bg-candypurple text-white" },
  { border: "border-candyblue", badge: "bg-candyblue text-white" },
  { border: "border-candyyellow", badge: "bg-candyyellow text-slate-950" },
];

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
    <div className="glass-candy pointer-events-auto absolute inset-x-4 bottom-6 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-candypurple">พบแล้ว!</p>
      <h3 className="mt-1 text-lg font-extrabold text-slate-900">{title}</h3>

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
          <p className="font-bold text-slate-800">{quizQuestion}</p>
          {quizOptions.map((opt, i) => {
            const isCorrect = i === correctOptionIndex;
            const isSelected = i === selected;
            const style = OPTION_STYLES[i % OPTION_STYLES.length];
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setSelected(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border-[3px] px-3 py-2 text-left text-sm font-semibold transition ${
                  answered && isSelected
                    ? isCorrect
                      ? "border-candygreen bg-candygreen/20"
                      : "border-rose-500 bg-rose-50"
                    : answered && isCorrect
                    ? "border-candygreen bg-candygreen/20"
                    : isSelected
                    ? `${style.border} bg-slate-50`
                    : `${style.border} bg-white`
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black ${style.badge}`}>
                  {i + 1}
                </span>
                <span className="text-slate-900">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {contentType === "QUIZ" ? (
          answered ? (
            <button onClick={() => onComplete(selected === correctOptionIndex)} className="btn-primary w-full">
              ไปด่านถัดไป
            </button>
          ) : (
            <button disabled={selected === null} onClick={() => setAnswered(true)} className="btn-primary w-full">
              ตอบคำถาม
            </button>
          )
        ) : (
          <button onClick={() => onComplete(true)} className="btn-primary w-full">
            ไปด่านถัดไป
          </button>
        )}
      </div>
    </div>
  );
}

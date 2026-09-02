"use client";

import { useEffect, useRef, useState } from "react";
import { loadScriptsInOrder, loadScript } from "@/lib/load-script";
import {
  buildQuizRounds,
  buildMatchingRounds,
  buildGroupingRounds,
  buildOrderingRounds,
  type GestureRound,
  type MatchingData,
  type GroupingData,
  type OrderingData,
} from "@/lib/gesture-config";

type ContentType = "MODEL_3D" | "IMAGE" | "TEXT" | "QUIZ" | "MATCHING" | "GROUPING" | "ORDERING";

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const OPTION_STYLES = [
  { border: "border-candypink", badge: "bg-candypink text-white" },
  { border: "border-candypurple", badge: "bg-candypurple text-white" },
  { border: "border-candyblue", badge: "bg-candyblue text-white" },
  { border: "border-candyyellow", badge: "bg-candyyellow text-slate-950" },
];

const DWELL_MS = 700;

function buildRounds(
  contentType: ContentType,
  quizQuestion: string | null,
  quizOptions: string[] | null,
  correctOptionIndex: number | null,
  activityData: Record<string, unknown> | null
): GestureRound[] {
  if (contentType === "QUIZ" && quizQuestion && quizOptions) {
    return buildQuizRounds(quizQuestion, quizOptions, correctOptionIndex ?? 0);
  }
  if (contentType === "MATCHING") return buildMatchingRounds((activityData as MatchingData) ?? { pairs: [] });
  if (contentType === "GROUPING")
    return buildGroupingRounds((activityData as GroupingData) ?? { categories: [], items: [] });
  if (contentType === "ORDERING") return buildOrderingRounds((activityData as OrderingData) ?? { items: [] });
  return [];
}

export function GestureActivityScene({
  title,
  contentType,
  quizQuestion,
  quizOptions,
  correctOptionIndex,
  activityData,
  onComplete,
}: {
  title: string;
  contentType: ContentType;
  quizQuestion: string | null;
  quizOptions: string[] | null;
  correctOptionIndex: number | null;
  activityData: Record<string, unknown> | null;
  onComplete: (correct: boolean) => void;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answeredRef = useRef(false);
  const roundIndexRef = useRef(0);
  const hoverStart = useRef<Record<number, number>>({});
  const lastActionTime = useRef(0);
  const selectRef = useRef<(idx: number) => void>(() => {});

  const [rounds] = useState<GestureRound[]>(() =>
    buildRounds(contentType, quizQuestion, quizOptions, correctOptionIndex, activityData)
  );
  const round = rounds[roundIndex];

  useEffect(() => {
    answeredRef.current = answered;
  }, [answered]);

  useEffect(() => {
    roundIndexRef.current = roundIndex;
    hoverStart.current = {};
  }, [roundIndex]);

  function selectOption(idx: number) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswered(true);
    setSelected(idx);

    const isCorrect = idx === rounds[roundIndexRef.current].correctIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      const w = window as unknown as { confetti?: (opts: Record<string, unknown>) => void };
      w.confetti?.({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    setTimeout(() => {
      const nextIndex = roundIndexRef.current + 1;
      if (nextIndex < rounds.length) {
        setRoundIndex(nextIndex);
        setSelected(null);
        setAnswered(false);
      } else {
        setCorrectCount((c) => {
          onComplete(c === rounds.length);
          return c;
        });
      }
    }, 1200);
  }

  useEffect(() => {
    selectRef.current = selectOption;
  });

  // Load MediaPipe Hands + camera utils + confetti, start webcam + tracking loop.
  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    const cleanupFns: (() => void)[] = [];

    loadScriptsInOrder([
      "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.4.1675469240/camera_utils.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js",
    ])
      .then(() => loadScript("https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js").catch(() => {}))
      .then(async () => {
        if (cancelled) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        function resize() {
          if (!canvas) return;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", resize);
        cleanupFns.push(() => window.removeEventListener("resize", resize));
        resize();

        const w = window as unknown as {
          Hands: new (config: { locateFile: (file: string) => string }) => {
            setOptions: (opts: Record<string, unknown>) => void;
            onResults: (cb: (results: HandsResults) => void) => void;
            send: (input: { image: HTMLVideoElement }) => Promise<void>;
          };
        };

        type HandsResults = {
          multiHandLandmarks?: { x: number; y: number; z: number }[][];
        };

        const hands = new w.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });

        const ctx = canvas.getContext("2d")!;

        function toScreen(lm: { x: number; y: number }) {
          const vw = video!.videoWidth || 1280;
          const vh = video!.videoHeight || 720;
          const cw = canvas!.width;
          const ch = canvas!.height;
          const vRatio = vw / vh;
          const cRatio = cw / ch;
          let rWidth, rHeight, ox, oy;
          if (cRatio > vRatio) {
            rWidth = cw;
            rHeight = cw / vRatio;
            ox = 0;
            oy = (ch - rHeight) / 2;
          } else {
            rWidth = ch * vRatio;
            rHeight = ch;
            ox = (cw - rWidth) / 2;
            oy = 0;
          }
          const mx = 1 - lm.x;
          return { x: ox + mx * rWidth, y: oy + lm.y * rHeight };
        }

        hands.onResults((results) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const landmarks = results.multiHandLandmarks?.[0];
          if (!landmarks) return;

          const pts = landmarks.map(toScreen);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
          ctx.lineWidth = 2.5;
          HAND_CONNECTIONS.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          });
          pts.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#ff5ca8";
            ctx.fill();
          });

          const tip = pts[8];
          const pinchDist = Math.hypot(landmarks[8].x - landmarks[4].x, landmarks[8].y - landmarks[4].y);
          const isPinching = pinchDist < 0.08;

          ctx.beginPath();
          ctx.arc(tip.x, tip.y, isPinching ? 20 : 16, 0, 2 * Math.PI);
          ctx.fillStyle = isPinching ? "#22c55e" : "#ff5ca8";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, isPinching ? 10 : 8, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          if (answeredRef.current) return;

          const now = Date.now();
          cardRefs.current.forEach((card, idx) => {
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const inCard = tip.x >= rect.left && tip.x <= rect.right && tip.y >= rect.top && tip.y <= rect.bottom;
            const progressEl = progressRefs.current[idx];

            if (!inCard) {
              delete hoverStart.current[idx];
              if (progressEl) progressEl.style.width = "0%";
              return;
            }

            if (isPinching && now - lastActionTime.current > 700) {
              lastActionTime.current = now;
              if (progressEl) progressEl.style.width = "100%";
              selectRef.current(idx);
              return;
            }

            if (hoverStart.current[idx] === undefined) hoverStart.current[idx] = now;
            const elapsed = now - hoverStart.current[idx];
            if (progressEl) progressEl.style.width = `${Math.min(100, (elapsed / DWELL_MS) * 100)}%`;
            if (elapsed >= DWELL_MS) {
              selectRef.current(idx);
            }
          });
        });

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          });
          video.srcObject = stream;
          await video.play();

          let processing = false;
          let rafId = 0;
          const loop = async () => {
            if (!processing && video.readyState >= 2) {
              processing = true;
              await hands.send({ image: video });
              processing = false;
            }
            rafId = requestAnimationFrame(loop);
          };
          rafId = requestAnimationFrame(loop);
          cleanupFns.push(() => cancelAnimationFrame(rafId));

          if (!cancelled) setReady(true);
        } catch {
          if (!cancelled) setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง");
        }
      })
      .catch(() => {
        if (!cancelled) setError("โหลดไลบรารีตรวจจับมือไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต");
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  if (rounds.length === 0) {
    return <p className="p-6 text-center text-slate-400">ด่านนี้ยังไม่มีข้อมูลกิจกรรม</p>;
  }

  return (
    <div className="absolute inset-0 bg-black">
      <video ref={videoRef} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {error && (
        <div className="absolute inset-x-4 top-20 rounded-xl bg-rose-900/90 p-3 text-center text-sm text-rose-100">
          {error}
        </div>
      )}
      {!ready && !error && (
        <div className="absolute inset-x-4 top-20 rounded-xl bg-slate-900/90 p-3 text-center text-sm text-slate-300">
          กำลังเตรียมกล้องตรวจจับมือ...
        </div>
      )}

      <div className="absolute inset-x-3 top-16 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2 backdrop-blur">
        <p className="truncate text-xs font-bold text-candyyellow md:text-sm">{title}</p>
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold text-candygreen md:text-sm">ถูก {correctCount}</p>
          <p className="text-xs font-bold text-candypink md:text-sm">
            ข้อ {roundIndex + 1}/{rounds.length}
          </p>
        </div>
      </div>

      <div className="glass-candy absolute inset-x-3 bottom-3 p-4">
        <p className="text-center text-base font-extrabold text-slate-900 md:text-lg">{round.prompt}</p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {round.options.map((opt, i) => {
            const style = OPTION_STYLES[i % OPTION_STYLES.length];
            const isCorrect = i === round.correctIndex;
            const isSelected = i === selected;
            const stateClass = answered
              ? isCorrect
                ? "border-candygreen bg-candygreen/25"
                : isSelected
                ? "border-rose-500 bg-rose-100"
                : "opacity-50 border-slate-200"
              : `${style.border} bg-white`;

            return (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`relative flex min-h-[64px] items-center gap-2 overflow-hidden rounded-2xl border-[3px] p-2.5 transition ${stateClass}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-black ${style.badge}`}>
                  {i + 1}
                </span>
                <span className="text-sm font-bold leading-snug text-slate-900">{opt}</span>
                <div
                  ref={(el) => {
                    progressRefs.current[i] = el;
                  }}
                  className="absolute bottom-0 left-0 h-1.5 w-0 bg-candypurple transition-[width]"
                />
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          ชี้นิ้วค้างไว้เหนือตัวเลือก หรือ &quot;หยิก&quot; นิ้วโป้ง-ชี้ เพื่อเลือกคำตอบ
        </p>
      </div>
    </div>
  );
}

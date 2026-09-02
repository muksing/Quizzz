"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MarkerARScene } from "./MarkerARScene";
import { LocationARScene } from "./LocationARScene";
import { ImageTargetARScene } from "./ImageTargetARScene";
import { FaceFilterARScene } from "./FaceFilterARScene";
import { GestureActivityScene } from "./GestureActivityScene";
import { StationOverlayCard } from "./StationOverlayCard";

type GameType = "MARKER" | "LOCATION" | "IMAGE_TARGET" | "FACE_FILTER" | "GESTURE";
type ContentType = "MODEL_3D" | "IMAGE" | "TEXT" | "QUIZ" | "MATCHING" | "GROUPING" | "ORDERING";

type Station = {
  id: string;
  title: string;
  config: Record<string, unknown>;
  contentType: ContentType;
  contentUrl: string | null;
  textContent: string | null;
  quizQuestion: string | null;
  quizOptions: string[] | null;
  correctOptionIndex: number | null;
  activityData: Record<string, unknown> | null;
};

export function GamePlayer({
  gameId,
  gameTitle,
  gameType,
  stations,
  canRecordProgress,
}: {
  gameId: string;
  gameTitle: string;
  gameType: GameType;
  stations: Station[];
  canRecordProgress: boolean;
}) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  useEffect(() => {
    if (!canRecordProgress) return;
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    })
      .then((res) => res.json())
      .then((data) => data.attempt && setAttemptId(data.attempt.id))
      .catch(() => {});
  }, [gameId, canRecordProgress]);

  const handleFound = useCallback(() => setFound(true), []);

  async function handleStationComplete(correct: boolean) {
    const station = stations[currentIndex];

    if (attemptId) {
      const res = await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: station.id, correct }),
      });
      const data = await res.json().catch(() => null);
      if (data?.attempt) setFinalScore(data.attempt.score);
    }

    if (currentIndex + 1 < stations.length) {
      setCurrentIndex((i) => i + 1);
      setFound(false);
    } else {
      setFinished(true);
    }
  }

  if (stations.length === 0) {
    return <p className="p-6 text-center text-slate-400">เกมนี้ยังไม่มีด่าน</p>;
  }

  if (finished) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-3xl">🎉</p>
        <h1 className="text-2xl font-extrabold text-white">เล่นจบแล้ว!</h1>
        <p className="text-slate-400">{gameTitle}</p>
        {finalScore !== null && <p className="text-lg font-bold text-candypink">คะแนน: {finalScore}</p>}
        <Link href="/student/dashboard" className="btn-primary mt-2">
          กลับไปหน้าห้องเรียน
        </Link>
      </div>
    );
  }

  const station = stations[currentIndex];

  return (
    <div className="relative flex-1 overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent p-3">
        <Link href="/student/dashboard" className="pointer-events-auto text-sm font-semibold text-white">
          ← ออก
        </Link>
        <p className="text-sm font-bold text-candyyellow">
          ด่านที่ {currentIndex + 1} / {stations.length}
        </p>
      </div>

      <div key={station.id} className="absolute inset-0">
        {gameType === "MARKER" && (
          <MarkerARScene
            config={station.config as never}
            contentType={station.contentType}
            contentUrl={station.contentUrl}
            onFound={handleFound}
          />
        )}
        {gameType === "LOCATION" && (
          <LocationARScene config={station.config as never} onFound={handleFound} />
        )}
        {gameType === "IMAGE_TARGET" && (
          <ImageTargetARScene
            config={station.config as never}
            contentType={station.contentType}
            contentUrl={station.contentUrl}
            onFound={handleFound}
          />
        )}
        {gameType === "FACE_FILTER" && (
          <FaceFilterARScene
            config={station.config as never}
            contentType={station.contentType}
            contentUrl={station.contentUrl}
            onFound={handleFound}
          />
        )}
        {gameType === "GESTURE" && (
          <GestureActivityScene
            title={station.title}
            contentType={station.contentType}
            quizQuestion={station.quizQuestion}
            quizOptions={station.quizOptions}
            correctOptionIndex={station.correctOptionIndex}
            activityData={station.activityData}
            onComplete={handleStationComplete}
          />
        )}
      </div>

      {found && gameType !== "GESTURE" && (
        <StationOverlayCard
          title={station.title}
          contentType={station.contentType}
          contentUrl={station.contentUrl}
          textContent={station.textContent}
          quizQuestion={station.quizQuestion}
          quizOptions={station.quizOptions}
          correctOptionIndex={station.correctOptionIndex}
          onComplete={handleStationComplete}
        />
      )}
    </div>
  );
}

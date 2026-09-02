"use client";

import { useEffect, useRef, useState } from "react";
import { loadScriptsInOrder } from "@/lib/load-script";
import { MARKER_PRESET_IMAGES } from "@/lib/ar-config";

type MarkerConfig = {
  markerMode: "preset" | "barcode" | "pattern";
  presetType?: "hiro" | "kanji";
  barcodeValue?: number;
  patternUrl?: string;
};

export function MarkerARScene({
  config,
  contentType,
  contentUrl,
  onFound,
}: {
  config: MarkerConfig;
  contentType: string;
  contentUrl: string | null;
  onFound: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadScriptsInOrder([
      "https://aframe.io/releases/1.5.0/aframe.min.js",
      "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js",
    ])
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setError("โหลดไลบรารี AR ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const markerEl = containerRef.current.querySelector("a-marker");
    if (!markerEl) return;
    const handler = () => onFound();
    markerEl.addEventListener("markerFound", handler);
    return () => markerEl.removeEventListener("markerFound", handler);
  }, [ready, onFound]);

  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;
  if (!ready) return <p className="p-4 text-center text-slate-500">กำลังเตรียมกล้อง AR...</p>;

  const markerAttrs: Record<string, string> =
    config.markerMode === "preset"
      ? { preset: config.presetType || "hiro" }
      : config.markerMode === "barcode"
      ? { type: "barcode", value: String(config.barcodeValue ?? 0) }
      : { type: "pattern", url: config.patternUrl || "" };

  return (
    <div ref={containerRef} className="absolute inset-0">
      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true;"
        style={{ width: "100%", height: "100%" }}
      >
        <a-marker {...markerAttrs}>
          {contentType === "MODEL_3D" && contentUrl && (
            <a-gltf-model src={contentUrl} scale="0.3 0.3 0.3" position="0 0.2 0" />
          )}
        </a-marker>
        <a-entity camera />
      </a-scene>
      {config.markerMode === "preset" && (
        <a
          href={MARKER_PRESET_IMAGES[config.presetType || "hiro"]}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white"
        >
          ดูมาร์กเกอร์ที่ต้องสแกน
        </a>
      )}
    </div>
  );
}

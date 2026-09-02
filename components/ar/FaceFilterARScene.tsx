"use client";

import { useEffect, useRef, useState } from "react";
import { loadScriptsInOrder } from "@/lib/load-script";
import { FACE_ANCHORS } from "@/lib/ar-config";

type FaceFilterConfig = {
  anchor: keyof typeof FACE_ANCHORS;
};

export function FaceFilterARScene({
  config,
  contentType,
  contentUrl,
  onFound,
}: {
  config: FaceFilterConfig;
  contentType: string;
  contentUrl: string | null;
  onFound: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const foundRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadScriptsInOrder([
      "https://aframe.io/releases/1.5.0/aframe.min.js",
      "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-aframe.prod.js",
    ])
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setError("โหลดไลบรารี AR ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const targetEl = containerRef.current.querySelector("[mindar-face-target]");

    const markFound = () => {
      if (foundRef.current) return;
      foundRef.current = true;
      onFound();
    };

    if (targetEl) {
      targetEl.addEventListener("targetFound", markFound);
    }
    // Fallback: face tracking doesn't always fire a discrete "found" event per anchor,
    // so also complete once the camera has had a couple seconds to lock onto a face.
    const fallback = setTimeout(markFound, 3000);

    return () => {
      targetEl?.removeEventListener("targetFound", markFound);
      clearTimeout(fallback);
    };
  }, [ready, onFound]);

  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;
  if (!ready) return <p className="p-4 text-center text-slate-500">กำลังเตรียมกล้อง AR...</p>;

  const anchorIndex = FACE_ANCHORS[config.anchor] ?? FACE_ANCHORS.forehead;

  return (
    <div ref={containerRef} className="absolute inset-0">
      <a-scene
        mindar-face
        color-space="sRGB"
        embedded
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style={{ width: "100%", height: "100%" }}
      >
        <a-camera active="false" position="0 0 0" />
        <a-entity mindar-face-target={`anchorIndex: ${anchorIndex}`}>
          {contentType === "MODEL_3D" && contentUrl && (
            <a-gltf-model src={contentUrl} scale="0.02 0.02 0.02" position="0 0 0" />
          )}
        </a-entity>
      </a-scene>
    </div>
  );
}

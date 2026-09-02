"use client";

import { useEffect, useRef, useState } from "react";
import { loadScriptsInOrder } from "@/lib/load-script";

type ImageTargetConfig = {
  mindFileUrl: string;
};

export function ImageTargetARScene({
  config,
  contentType,
  contentUrl,
  onFound,
}: {
  config: ImageTargetConfig;
  contentType: string;
  contentUrl: string | null;
  onFound: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.mindFileUrl) return;
    let cancelled = false;
    loadScriptsInOrder([
      "https://aframe.io/releases/1.5.0/aframe.min.js",
      "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js",
    ])
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setError("โหลดไลบรารี AR ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต"));
    return () => {
      cancelled = true;
    };
  }, [config.mindFileUrl]);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const targetEl = containerRef.current.querySelector("[mindar-image-target]");
    if (!targetEl) return;
    const handler = () => onFound();
    targetEl.addEventListener("targetFound", handler);
    return () => targetEl.removeEventListener("targetFound", handler);
  }, [ready, onFound]);

  if (!config.mindFileUrl) {
    return <p className="p-4 text-center text-red-600">ด่านนี้ยังไม่ได้อัปโหลดไฟล์ภาพเป้าหมาย (.mind)</p>;
  }
  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;
  if (!ready) return <p className="p-4 text-center text-slate-500">กำลังเตรียมกล้อง AR...</p>;

  return (
    <div ref={containerRef} className="absolute inset-0">
      <a-scene
        mindar-image={`imageTargetSrc: ${config.mindFileUrl}; autoStart: true; uiScanning: no;`}
        color-space="sRGB"
        embedded
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style={{ width: "100%", height: "100%" }}
      >
        <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" />
        <a-entity mindar-image-target="targetIndex: 0">
          {contentType === "MODEL_3D" && contentUrl && (
            <a-gltf-model src={contentUrl} scale="0.05 0.05 0.05" position="0 0 0" rotation="0 0 0" />
          )}
        </a-entity>
      </a-scene>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { distanceMeters } from "@/lib/geo";

type LocationConfig = {
  lat: number;
  lng: number;
  radiusMeters?: number;
};

export function LocationARScene({
  config,
  onFound,
}: {
  config: LocationConfig;
  onFound: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const foundRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง"));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const geolocationSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  useEffect(() => {
    if (!geolocationSupported) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const d = distanceMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          config.lat,
          config.lng
        );
        setDistance(d);
        if (!foundRef.current && d <= (config.radiusMeters ?? 20)) {
          foundRef.current = true;
          onFound();
        }
      },
      () => setError("ไม่สามารถเข้าถึงตำแหน่ง GPS ได้ กรุณาอนุญาตการใช้ตำแหน่ง"),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [config.lat, config.lng, config.radiusMeters, onFound, geolocationSupported]);

  return (
    <div className="absolute inset-0 bg-black">
      <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />

      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white">
          {!geolocationSupported
            ? "อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง GPS"
            : error
            ? error
            : distance === null
            ? "กำลังค้นหาตำแหน่ง..."
            : distance <= (config.radiusMeters ?? 20)
            ? "ถึงจุดหมายแล้ว!"
            : `เหลืออีก ${Math.round(distance)} เมตร`}
        </div>
      </div>
    </div>
  );
}

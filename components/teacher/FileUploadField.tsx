"use client";

import { useState } from "react";

export function FileUploadField({
  label,
  accept,
  value,
  onChange,
}: {
  label: string;
  accept: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error || "อัปโหลดไม่สำเร็จ");
      return;
    }

    onChange(data.url);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFile}
        className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
      />
      {uploading && <p className="mt-1 text-xs text-slate-400">กำลังอัปโหลด...</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {value && !uploading && (
        <p className="mt-1 truncate text-xs text-emerald-600">อัปโหลดแล้ว: {value}</p>
      )}
    </div>
  );
}

// Shared shape/labels for the per-station `config` JSON, keyed by Game.type.
// Keeping this centralized so the editor UI and the AR player agree on field names.

export type MarkerConfig = {
  markerMode: "preset" | "barcode" | "pattern";
  presetType?: "hiro" | "kanji";
  barcodeValue?: number; // 0-99, AR.js built-in barcode markers
  patternUrl?: string; // uploaded .patt file
};

export type LocationConfig = {
  lat: number;
  lng: number;
  radiusMeters?: number; // trigger distance, default 20
};

export type ImageTargetConfig = {
  mindFileUrl: string; // pre-compiled .mind file (via MindAR image target compiler)
};

// Named, human-friendly anchor points on MindAR's 468-point face mesh.
export const FACE_ANCHORS: Record<string, number> = {
  forehead: 10,
  nose: 1,
  chin: 152,
  leftCheek: 234,
  rightCheek: 454,
};

export type FaceFilterConfig = {
  anchor: keyof typeof FACE_ANCHORS;
};

export const MARKER_PRESET_IMAGES: Record<"hiro" | "kanji", string> = {
  hiro: "https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png",
  kanji: "https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.png",
};

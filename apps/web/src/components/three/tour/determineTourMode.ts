import type { PropertyCardMedia } from "@/types/property";

export type TourMode = "model" | "panorama";

/**
 * Pure media-array inspection, deliberately kept in its own file with zero
 * three.js/@react-three imports. PropertyGallery and Tour3DModal need this
 * synchronously (to decide whether to even show a "3D Tour" button) without
 * pulling the ~250kB 3D stack into the main property-page bundle — that
 * stack only loads once the visitor actually opens the tour, via the
 * next/dynamic(..., { ssr: false }) import in PropertyTourViewer.tsx.
 */
export function determineTourMode(media: PropertyCardMedia[]): { mode: TourMode; asset: PropertyCardMedia } | null {
  const model = media.find((m) => m.type === "MODEL_3D");
  if (model) return { mode: "model", asset: model };
  const pano = media.find((m) => m.type === "IMAGE_360" || m.type === "VIDEO_360");
  if (pano) return { mode: "panorama", asset: pano };
  return null;
}

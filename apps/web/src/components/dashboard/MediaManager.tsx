"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Box, Film, ImageIcon, Loader2, Star, Trash2, UploadCloud, View } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/upload";
import { cn } from "@/lib/utils";
import type { PropertyCardMedia } from "@/types/property";

const MEDIA_TYPES: { value: PropertyCardMedia["type"]; label: string; accept: string; icon: typeof ImageIcon }[] = [
  { value: "IMAGE", label: "Photo", accept: "image/jpeg,image/png,image/webp", icon: ImageIcon },
  { value: "VIDEO", label: "Walkthrough video", accept: "video/mp4,video/webm,video/quicktime", icon: Film },
  { value: "IMAGE_360", label: "360° photo", accept: "image/jpeg,image/png", icon: View },
  { value: "MODEL_3D", label: "3D model (.glb)", accept: ".glb,.gltf,model/gltf-binary", icon: Box },
];

export function MediaManager({
  propertyId,
  media,
  onChanged,
}: {
  propertyId: string;
  media: PropertyCardMedia[];
  onChanged: () => void;
}) {
  const [activeType, setActiveType] = useState<PropertyCardMedia["type"]>("IMAGE");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const typeConfig = MEDIA_TYPES.find((t) => t.value === activeType)!;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        setProgress(0);
        const url = await uploadFile(file, { context: "property", propertyId }, setProgress);
        await api.post(`/api/properties/${propertyId}/media`, {
          type: activeType,
          url,
          isPrimary: activeType === "IMAGE" && media.filter((m) => m.type === "IMAGE").length === 0,
        });
      }
      toast.success("Media uploaded");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function setPrimary(mediaId: string) {
    try {
      await api.patch(`/api/properties/${propertyId}/media/${mediaId}`, { isPrimary: true });
      onChanged();
    } catch {
      toast.error("Couldn't set primary photo");
    }
  }

  async function remove(mediaId: string) {
    if (!confirm("Remove this media item?")) return;
    try {
      await api.del(`/api/properties/${propertyId}/media/${mediaId}`);
      onChanged();
    } catch {
      toast.error("Couldn't remove media");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {MEDIA_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setActiveType(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeType === t.value ? "border-ember-500/60 bg-ember-500/15 text-ember-300" : "border-white/10 text-white/60 hover:bg-white/[0.06]"
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-10 text-white/50 transition-colors hover:border-ember-500/40 hover:text-white/70"
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Uploading… {progress}%</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6" />
            <span className="text-sm">Click to upload {typeConfig.label.toLowerCase()}</span>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={typeConfig.accept}
        multiple={activeType === "IMAGE"}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {media.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {m.type === "IMAGE" || m.type === "IMAGE_360" ? (
                <Image src={m.url} alt="" fill sizes="200px" className="object-cover" />
              ) : m.type === "VIDEO" ? (
                <video src={m.url} className="h-full w-full object-cover" muted />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-white/40">
                  <Box className="h-6 w-6" />
                  <span className="text-[10px]">3D model</span>
                </div>
              )}
              {m.isPrimary && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-ember-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" /> Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:bg-black/40 sm:group-hover:opacity-100">
                {m.type === "IMAGE" && !m.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => setPrimary(m.id)}
                    className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1.5 text-[10px] font-medium text-white hover:bg-ember-500"
                  >
                    <Star className="h-3 w-3" /> Set as cover
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

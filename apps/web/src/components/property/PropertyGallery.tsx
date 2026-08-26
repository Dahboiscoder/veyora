"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { ShareButton } from "./ShareButton";
import { FeaturedBadge, VerifiedBadge } from "./PropertyBadges";
import { determineTourMode } from "@/components/three/tour/determineTourMode";
import { Tour3DModal } from "@/components/three/tour/Tour3DModal";
import { cn } from "@/lib/utils";
import type { PropertyCardMedia } from "@/types/property";

export function PropertyGallery({
  media,
  title,
  isFeatured,
  isVerified,
  propertyId,
  isFavorited,
  liveStreamId,
}: {
  media: PropertyCardMedia[];
  title: string;
  isFeatured: boolean;
  isVerified: boolean;
  propertyId: string;
  isFavorited: boolean;
  liveStreamId?: string;
}) {
  const images = media.filter((m) => m.type === "IMAGE");
  const video = media.find((m) => m.type === "VIDEO");
  const tour = determineTourMode(media);

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  function scrollTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    setIndex(i);
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  const gallery = images.length > 0 ? images : media.filter((m) => m.thumbnailUrl || m.type === "IMAGE");

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex aspect-[16/10] w-full snap-x snap-mandatory overflow-x-auto rounded-2xl bg-void-900 sm:aspect-[16/8]"
        >
          {gallery.length > 0 ? (
            gallery.map((m, i) => (
              <div key={m.id} className="relative h-full w-full shrink-0 snap-start">
                <Image
                  src={m.url}
                  alt={`${title} — photo ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <div className="grid h-full w-full shrink-0 snap-start place-items-center text-white/20">No photos yet</div>
          )}
        </div>

        {gallery.length > 1 && (
          <>
            <button
              onClick={() => scrollTo(Math.max(0, index - 1))}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollTo(Math.min(gallery.length - 1, index + 1))}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {gallery.length}
            </div>
          </>
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          {isFeatured && <FeaturedBadge />}
          {isVerified && <VerifiedBadge />}
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <ShareButton title={title} />
          <FavoriteButton propertyId={propertyId} initialFavorited={isFavorited} />
        </div>
      </div>

      {gallery.length > 1 && (
        <div className="no-scrollbar mt-3 hidden gap-2 overflow-x-auto sm:flex">
          {gallery.map((m, i) => (
            <button
              key={m.id}
              onClick={() => scrollTo(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === index ? "border-ember-500" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={m.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {liveStreamId && (
          <a href={`/live/${liveStreamId}`} className="btn-primary !bg-red-500 !from-red-500 !to-red-500 !px-4 !py-2 text-sm">
            <span className="live-dot !bg-white" /> Watch Live Now
          </a>
        )}
        {tour && (
          <button onClick={() => setTourOpen(true)} className="btn-secondary !px-4 !py-2 text-sm">
            {tour.mode === "model" ? "Enter 3D Tour" : "View 360° Tour"}
          </button>
        )}
        {video && (
          <button onClick={() => setVideoOpen(true)} className="btn-secondary !px-4 !py-2 text-sm">
            <Play className="h-3.5 w-3.5" /> Watch Video
          </button>
        )}
      </div>

      {tour && <Tour3DModal open={tourOpen} onClose={() => setTourOpen(false)} media={media} title={title} />}

      {videoOpen && video && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setVideoOpen(false)}>
          <video src={video.url} controls autoPlay className="max-h-[85vh] w-full max-w-4xl rounded-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

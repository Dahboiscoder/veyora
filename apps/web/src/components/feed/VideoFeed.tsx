"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { FeedSlide } from "./FeedSlide";
import type { PropertyCardData, PropertySearchResponse } from "@/types/property";

export function VideoFeed({ initialProperties }: { initialProperties: PropertyCardData[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [properties.length]);

  useEffect(() => {
    if (!sentinelRef.current || exhausted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exhausted, page]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get<PropertySearchResponse>(`/api/properties?sort=newest&page=${nextPage}&pageSize=10`);
      if (res.items.length === 0) setExhausted(true);
      else {
        setProperties((prev) => [...prev, ...res.items]);
        setPage(nextPage);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  if (properties.length === 0) {
    return (
      <div className="flex h-[100svh] items-center justify-center text-white/40">No properties to show yet.</div>
    );
  }

  return (
    <div ref={containerRef} className="no-scrollbar h-[100svh] snap-y snap-mandatory overflow-y-scroll bg-black">
      {properties.map((property, i) => (
        <div
          key={property.id}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
        >
          <FeedSlide property={property} active={i === activeIndex} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
        </div>
      ))}
      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      )}
    </div>
  );
}

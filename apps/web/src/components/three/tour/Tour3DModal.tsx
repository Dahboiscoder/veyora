"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { determineTourMode } from "./determineTourMode";
import type { PropertyCardMedia } from "@/types/property";

const PropertyTourViewer = dynamic(
  () => import("./PropertyTourViewer").then((m) => m.PropertyTourViewer),
  { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center text-white/40">Loading tour…</div> }
);

export function Tour3DModal({
  open,
  onClose,
  media,
  title,
}: {
  open: boolean;
  onClose: () => void;
  media: PropertyCardMedia[];
  title: string;
}) {
  const tour = determineTourMode(media);

  return (
    <AnimatePresence>
      {open && tour && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-void-950"
        >
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 sm:left-6 sm:top-6">
            <span className="chip !bg-black/50 backdrop-blur">
              {tour.mode === "model" ? "3D TOUR" : "360° TOUR"}
            </span>
            <span className="hidden text-sm font-medium text-white/70 sm:inline">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 sm:right-6 sm:top-6"
            aria-label="Close tour"
          >
            <X className="h-5 w-5" />
          </button>
          <PropertyTourViewer media={media} title={title} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

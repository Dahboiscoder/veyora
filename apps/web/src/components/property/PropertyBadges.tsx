import { BadgeCheck, Box, Radio, Sparkles, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function LiveBadge({ viewers, className }: { viewers?: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg", className)}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      LIVE{typeof viewers === "number" ? ` · ${viewers}` : ""}
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1 rounded-full bg-aurora-500/90 px-2.5 py-1 text-xs font-semibold text-void-950", className)}>
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1 rounded-full bg-gradient-to-r from-ember-500 to-ember-400 px-2.5 py-1 text-xs font-semibold text-white", className)}>
      <Sparkles className="h-3.5 w-3.5" /> Featured
    </span>
  );
}

export function TourBadge({ className }: { className?: string }) {
  return (
    <span className={cn("chip !bg-black/50 backdrop-blur", className)}>
      <Box className="h-3.5 w-3.5" /> 3D Tour
    </span>
  );
}

export function VideoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("chip !bg-black/50 backdrop-blur", className)}>
      <Video className="h-3.5 w-3.5" /> Video
    </span>
  );
}

export function Live360Badge({ className }: { className?: string }) {
  return (
    <span className={cn("chip !bg-black/50 backdrop-blur", className)}>
      <Radio className="h-3.5 w-3.5" /> 360°
    </span>
  );
}

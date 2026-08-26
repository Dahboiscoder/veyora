"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title, className }: { title: string; className?: string }) {
  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user canceled — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  return (
    <button
      onClick={share}
      aria-label="Share property"
      className={`grid h-10 w-10 place-items-center rounded-full glass transition-transform hover:scale-110 active:scale-95 ${className ?? ""}`}
    >
      <Share2 className="h-4 w-4 text-white" />
    </button>
  );
}

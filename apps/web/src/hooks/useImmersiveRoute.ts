"use client";

import { usePathname } from "next/navigation";

// Routes that want a true full-bleed, no-chrome experience (no navbar,
// footer, or mobile tab bar) — the video feed, and later full-screen live
// viewing. Prefix-matched so nested routes (e.g. /feed/[id]) qualify too.
const IMMERSIVE_PREFIXES = ["/feed"];

export function useImmersiveRoute(): boolean {
  const pathname = usePathname();
  return IMMERSIVE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

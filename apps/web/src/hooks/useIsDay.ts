"use client";

import { useEffect, useState } from "react";

/**
 * Day/night from the visitor's own clock (6am-6pm local = day). Resolved
 * client-side only, after mount — the server has no idea what timezone the
 * visitor is actually in, so guessing on the server would just cause a
 * hydration mismatch. Returns `null` for the brief instant before mount;
 * callers should pick a reasonable default (this app defaults to night)
 * for that window rather than blocking render on it.
 */
export function useIsDay(): boolean | null {
  const [isDay, setIsDay] = useState<boolean | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);
  }, []);

  return isDay;
}

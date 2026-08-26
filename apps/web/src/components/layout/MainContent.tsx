"use client";

import { useImmersiveRoute } from "@/hooks/useImmersiveRoute";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const immersive = useImmersiveRoute();
  return <main className={cn("min-h-screen", !immersive && "pb-16 md:pb-0")}>{children}</main>;
}

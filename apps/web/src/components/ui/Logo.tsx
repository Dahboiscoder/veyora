"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const bouncy = { type: "spring" as const, stiffness: 420, damping: 11 };

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <motion.span
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ember-aurora shadow-glow"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.85, rotate: -10 }}
        transition={bouncy}
      >
        <span className="absolute inset-[1.5px] rounded-[10px] bg-void-950" />
        <span className="relative font-display text-sm font-bold text-gradient">V</span>
      </motion.span>
      <motion.span
        className="flex flex-col leading-none"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.04, y: -1 }}
        transition={bouncy}
      >
        <span className="font-display text-lg font-semibold tracking-tight text-white">VEYORA</span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.14em] text-white/60">
          Buy • Rent • Stay • Sell
        </span>
      </motion.span>
    </Link>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Box, ChevronDown, Moon, Plane, Radio, Sun } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDay } from "@/hooks/useIsDay";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/listings?listingType=RENT", label: "Rent" },
  { href: "/listings?listingType=SHORT_STAY", label: "Short Stay" },
  { href: "/live", label: "Live Tour" },
];

const STATS = [
  { label: "Verified listings", value: "1,200+" },
  { label: "African countries", value: "11" },
  { label: "3D & live tours", value: "Daily" },
];

/** A small aircraft towing an advertising banner across the sky — like the
 * real banner planes over a beach or stadium — carrying its own tiny bit of
 * marketing. Styled differently for day (dark plane + light cloth banner,
 * both readable against a bright sky) and night (pale plane silhouette
 * with a blinking anti-collision light + a glassy backlit banner), driven
 * by the same clock read as the sky photo and the sun/moon. Loops on a
 * long, irregular cycle so it reads as ambient rather than a repeating
 * loop the eye catches. */
function BannerPlane({ isDay }: { isDay: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-[13%] flex items-center gap-2"
      initial={{ x: "-60vw", opacity: 0 }}
      animate={{ x: "130vw", opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 52,
        repeat: Infinity,
        repeatDelay: 20,
        ease: "linear",
        opacity: { duration: 52, times: [0, 0.03, 0.95, 1] },
      }}
    >
      {/* Banner, trailing behind the plane on its tow line */}
      <div className="flex items-center">
        <div
          className={cn(
            "rounded-[3px] border px-3 py-1.5 shadow-lg sm:px-4 sm:py-2",
            isDay ? "border-void-900/15 bg-white/95" : "border-white/15 bg-void-900/90 backdrop-blur-sm"
          )}
        >
          <span
            className={cn(
              "whitespace-nowrap text-[10px] font-bold uppercase tracking-wider sm:text-xs",
              isDay ? "text-void-900" : "text-white"
            )}
          >
            Buy • Rent • Stay • Sell
          </span>
        </div>
        <div className={cn("h-px w-6 sm:w-8", isDay ? "bg-void-900/25" : "bg-white/25")} />
      </div>

      {/* Plane */}
      <div className="relative shrink-0">
        <Plane
          className={cn("h-6 w-6 rotate-45 sm:h-8 sm:w-8", isDay ? "text-void-800 drop-shadow" : "text-white/80")}
          strokeWidth={1.4}
        />
        {!isDay && (
          <motion.span
            className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-red-400 sm:h-2 sm:w-2"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}

/** Sun by day, moon by night. `isDay` is lifted to Hero so the same clock
 * read also drives which background photo shows — the sky icon and the
 * photo never disagree with each other. */
function CelestialBody({ isDay }: { isDay: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute right-[16%] top-[9%] sm:right-[20%] sm:top-[7%]">
      <motion.div
        className={cn("absolute -inset-5 rounded-full blur-2xl", isDay ? "bg-ember-400/50" : "bg-aurora-100/25")}
        animate={reducedMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {isDay ? (
        <Sun className="relative h-8 w-8 text-ember-300 sm:h-10 sm:w-10" strokeWidth={1.4} />
      ) : (
        <Moon className="relative h-7 w-7 fill-slate-100 text-slate-100 sm:h-9 sm:w-9" strokeWidth={1} />
      )}
    </div>
  );
}

export function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Default to the night photo/moon until the visitor's clock resolves
  // client-side, rather than leaving the two out of sync mid-hydration.
  const isDay = useIsDay() === true;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] items-center overflow-hidden bg-void-950">
      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? undefined : { y: parallaxY, scale: parallaxScale }}
      >
        <Image
          src={isDay ? "/hero/city-skyline-day.jpg" : "/hero/city-skyline-night.jpg"}
          alt={isDay ? "African city skyline in daylight" : "African city skyline at night"}
          fill
          priority
          sizes="100vw"
          className={reducedMotion ? "object-cover" : "object-cover animate-[kenburns_32s_ease-in-out_infinite]"}
        />
      </motion.div>

      <div className="absolute inset-0 bg-grid-glow mix-blend-screen opacity-70" />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t to-void-950/30",
          isDay ? "from-void-950/90 via-void-950/60" : "from-void-950 via-void-950/55"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void-950/70 via-transparent to-transparent" />

      <CelestialBody isDay={isDay} />
      {!reducedMotion && <BannerPlane isDay={isDay} />}

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-24 text-center lg:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-label mb-6 flex items-center gap-2 rounded-full glass px-4 py-1.5"
        >
          <span className="live-dot" /> Live across 11 African countries
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Real estate,{" "}
          <span className="text-gradient">property for everyone.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-balance text-lg text-white/60"
        >
          Walk through properties before you visit. Watch live tours. Discover homes the way you
          discover everything else — immersive, cinematic, instant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/live" className="btn-primary !bg-red-500 !from-red-500 !to-red-500">
            <Radio className="h-4 w-4" /> Live Now
          </Link>
          <Link href="/register?role=OWNER" className="btn-secondary">
            <Box className="h-4 w-4" /> List Property
          </Link>
          <Link href="/listings?listingType=SALE" className="btn-primary">
            Buy Now <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="chip hover:bg-white/[0.1]">
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 hidden justify-center gap-4 px-6 sm:flex">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
            className={`glass-card pointer-events-auto px-5 py-3 ${i % 2 === 0 ? "animate-float" : "animate-float-delay"}`}
          >
            <p className="font-display text-xl font-semibold text-white">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 bottom-8 flex justify-center text-white/40"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}

import Link from "next/link";
import { Box, Clapperboard, Radio, ArrowUpRight } from "lucide-react";

const FEATURES = [
  {
    href: "/tours",
    icon: Box,
    label: "3D & 360° Tours",
    title: "Walk through before you visit",
    description:
      "Explore interactive 3D walkthroughs and 360° panoramas. Move around every room, right from your phone.",
    accent: "from-ember-500/20 to-transparent",
    iconColor: "text-ember-400",
  },
  {
    href: "/live",
    icon: Radio,
    label: "Live Tours",
    title: "Tour properties in real time",
    description:
      "Join agents live, ask questions in chat, watch the viewer count grow, and schedule a private viewing on the spot.",
    accent: "from-red-500/20 to-transparent",
    iconColor: "text-red-400",
  },
  {
    href: "/feed",
    icon: Clapperboard,
    label: "Video Feed",
    title: "Discover properties like Reels",
    description:
      "Swipe through walkthroughs, luxury homes, and short stays in a fast, cinematic, vertical feed built for discovery.",
    accent: "from-aurora-500/20 to-transparent",
    iconColor: "text-aurora-400",
  },
];

export function FeatureShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="section-label">Not your average listing site</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Three ways to experience a property before you ever step inside.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-void-900/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-60 transition-opacity group-hover:opacity-100`} />
            <div className="relative">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl glass">
                <f.icon className={`h-6 w-6 ${f.iconColor}`} />
              </div>
              <p className="section-label mb-2">{f.label}</p>
              <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{f.description}</p>
            </div>
            <div className="relative mt-8 flex items-center gap-1 text-sm font-semibold text-white/80">
              Explore
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

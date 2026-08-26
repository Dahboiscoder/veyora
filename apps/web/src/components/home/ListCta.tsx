import Link from "next/link";
import { ArrowRight, BadgeCheck, LineChart, Radio } from "lucide-react";

const PERKS = [
  { icon: BadgeCheck, text: "Get a verified badge that builds instant trust" },
  { icon: Radio, text: "Host live tours and reach buyers in real time" },
  { icon: LineChart, text: "Track views, likes, and inquiries in one dashboard" },
];

export function ListCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-void-900 to-void-950 p-10 sm:p-16">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-aurora-500/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="section-label">For agents, owners & agencies</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              List your property where buyers actually discover.
            </h2>
            <p className="mt-4 max-w-md text-white/55">
              Upload photos, video, 360° tours, or a full 3D model — VEYORA automatically builds the
              best possible experience for every listing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register?role=OWNER" className="btn-primary">
                List Your Property <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn-secondary">
                See pricing
              </Link>
            </div>
          </div>
          <ul className="flex flex-col gap-4">
            {PERKS.map((perk) => (
              <li key={perk.text} className="glass-card flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <perk.icon className="h-5 w-5 text-ember-400" />
                </div>
                <p className="text-sm text-white/80">{perk.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

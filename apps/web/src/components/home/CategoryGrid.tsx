import Link from "next/link";
import { Building2, Home, Palmtree, Trees } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const CATEGORIES = [
  { href: "/listings?category=RESIDENTIAL", icon: Home, label: "Residential", desc: "Houses, apartments, villas & more" },
  { href: "/listings?category=COMMERCIAL", icon: Building2, label: "Commercial", desc: "Offices, shops, warehouses & hotels" },
  { href: "/listings?category=LAND", icon: Trees, label: "Land", desc: "Residential, commercial & agricultural" },
  { href: "/listings?category=SHORT_STAY", icon: Palmtree, label: "Short Stay", desc: "Vacation homes & serviced apartments" },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading eyebrow="Browse" title="Find exactly what you're looking for" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-void-900/50 p-6 transition-all hover:-translate-y-1 hover:border-ember-500/40 hover:bg-void-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] transition-colors group-hover:bg-ember-500/20">
              <cat.icon className="h-5 w-5 text-white/80 transition-colors group-hover:text-ember-400" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">{cat.label}</p>
              <p className="mt-1 text-xs text-white/50">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { LAUNCH_COUNTRIES } from "@nyumba/shared";

export function CountryStrip() {
  const countries = [...LAUNCH_COUNTRIES, ...LAUNCH_COUNTRIES];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-void-900/40 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void-950 to-transparent" />
      <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
        {countries.map((c, i) => (
          <Link
            key={`${c.code}-${i}`}
            href={`/listings?countryCode=${c.code}`}
            className="chip shrink-0 hover:bg-white/[0.1]"
          >
            <span className="text-base">{c.flagEmoji}</span> {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

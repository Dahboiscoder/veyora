"use client";

import Link from "next/link";
import { LAUNCH_COUNTRIES } from "@nyumba/shared";
import { Logo } from "@/components/ui/Logo";
import { useImmersiveRoute } from "@/hooks/useImmersiveRoute";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      { href: "/listings?listingType=SALE", label: "Buy a property" },
      { href: "/listings?listingType=RENT", label: "Rent a property" },
      { href: "/listings?listingType=SHORT_STAY", label: "Short stays" },
      { href: "/tours", label: "3D & virtual tours" },
      { href: "/live", label: "Live tours" },
      { href: "/feed", label: "Video feed" },
    ],
  },
  {
    title: "For professionals",
    links: [
      { href: "/register?role=AGENT", label: "Become an agent" },
      { href: "/register?role=COMPANY", label: "List your agency" },
      { href: "/register?role=OWNER", label: "List your property" },
      { href: "/pricing", label: "Featured listings & pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About VEYORA" },
      { href: "/trust", label: "Trust & verification" },
      { href: "/contact", label: "Contact us" },
      { href: "/help", label: "Help center" },
    ],
  },
];

export function Footer() {
  const immersive = useImmersiveRoute();
  if (immersive) return null;

  return (
    <footer className="hidden border-t border-white/10 bg-void-900/60 md:block">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              A cinematic, immersive real-estate marketplace built for Africa — 3D tours, live
              viewings, and verified agents across the continent.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/50 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="section-label mb-3">Live in {LAUNCH_COUNTRIES.length} countries</p>
          <div className="flex flex-wrap gap-2">
            {LAUNCH_COUNTRIES.map((c) => (
              <Link key={c.code} href={`/listings?countryCode=${c.code}`} className="chip hover:bg-white/[0.1]">
                <span>{c.flagEmoji}</span> {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} VEYORA. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/terms" className="hover:text-white/70">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-white/70">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

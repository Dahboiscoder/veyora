"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MessageCircle, Menu, X, PlusCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useCurrentUser, CAN_LIST_PROPERTIES } from "@/hooks/useCurrentUser";
import { useImmersiveRoute } from "@/hooks/useImmersiveRoute";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/listings?listingType=SALE", label: "Buy" },
  { href: "/listings?listingType=RENT", label: "Rent" },
  { href: "/listings?listingType=SHORT_STAY", label: "Short Stay" },
  { href: "/live", label: "Live Tour", live: true },
  { href: "/feed", label: "Video Feed" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useCurrentUser();
  const immersive = useImmersiveRoute();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const canList = isAuthenticated && user && CAN_LIST_PROPERTIES.includes(user.role);

  if (immersive) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen ? "glass border-b border-white/10" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {link.live && <span className="live-dot" />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-full glass px-4 py-2 text-sm text-white/60 transition-colors hover:text-white sm:flex"
          >
            <Search className="h-4 w-4" />
            <span>Search properties…</span>
          </Link>
          <Link
            href="/search"
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/[0.06] sm:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/messages"
                className="hidden h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/[0.06] sm:grid"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
              {canList && (
                <Link href="/dashboard/properties/new" className="btn-primary hidden !px-4 !py-2 text-sm lg:inline-flex">
                  <PlusCircle className="h-4 w-4" />
                  List Property
                </Link>
              )}
              <UserMenu user={user!} />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn-ghost text-sm">
                Log in
              </Link>
              <Link href="/register?role=OWNER" className="btn-primary !px-4 !py-2 text-sm">
                List Your Property
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/[0.06] lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-medium text-white/80 hover:bg-white/[0.06]"
              >
                {link.live && <span className="live-dot" />}
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/login" className="btn-secondary w-full">
                  Log in
                </Link>
                <Link href="/register?role=OWNER" className="btn-primary w-full">
                  List Your Property
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

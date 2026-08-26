"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPinned, Clapperboard, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useImmersiveRoute } from "@/hooks/useImmersiveRoute";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  // There's no standalone /map route — the map lives inside /listings as a
  // toggleable view. ?map=1 opens straight into it (see ListingsPageInner).
  { href: "/listings?map=1", label: "Map", icon: MapPinned, matchPathname: "/listings" },
  { href: "/feed", label: "Reels", icon: Clapperboard },
  { href: "/live", label: "Live", icon: Radio },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useCurrentUser();
  const immersive = useImmersiveRoute();

  if (immersive) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-void-950/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === (tab.matchPathname ?? tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-ember-400" : "text-white/50"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {tab.label}
            </Link>
          );
        })}
        <Link
          href={isAuthenticated ? "/dashboard" : "/login"}
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            pathname.startsWith("/dashboard") || pathname.startsWith("/login") ? "text-ember-400" : "text-white/50"
          )}
        >
          {isAuthenticated && user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5" />
          )}
          {isAuthenticated ? "Profile" : "Log in"}
        </Link>
      </div>
    </nav>
  );
}

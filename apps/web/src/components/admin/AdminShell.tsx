"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, Flag, Star, Radio, CreditCard, Globe2, Loader2, ShieldCheck } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/live", label: "Live tours", icon: Radio },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/countries", label: "Countries", icon: Globe2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return router.push("/login?redirect=/admin");
    if (user && user.role !== "ADMIN") router.push("/");
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 flex items-center gap-2 px-1 text-sm font-semibold text-white/80">
          <ShieldCheck className="h-4 w-4 text-aurora-400" /> Admin console
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-aurora-500/15 text-aurora-300" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

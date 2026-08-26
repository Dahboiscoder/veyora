"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, PlusCircle, CalendarClock, Radio, CreditCard, Loader2 } from "lucide-react";
import { useCurrentUser, CAN_LIST_PROPERTIES } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/properties/new", label: "Add Property", icon: PlusCircle },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: CalendarClock },
  { href: "/dashboard/live", label: "Live Tours", icon: Radio },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return router.push("/login?redirect=/dashboard");
    if (user && !CAN_LIST_PROPERTIES.includes(user.role)) router.push("/");
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || !CAN_LIST_PROPERTIES.includes(user.role)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-ember-500/15 text-ember-300" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
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

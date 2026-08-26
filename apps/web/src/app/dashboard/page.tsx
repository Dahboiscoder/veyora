"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, Eye, Heart, CalendarClock, Radio, ArrowRight } from "lucide-react";
import { api } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatTile } from "@/components/dashboard/StatTile";
import { ViewsChart, type ViewsChartPoint } from "@/components/dashboard/ViewsChart";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import type { PropertyCardData } from "@/types/property";

interface DashboardStats {
  total: number;
  published: number;
  draft: number;
  sold: number;
  totalViews: number;
  totalLikes: number;
  totalFavorites: number;
  pendingViewings: number;
  activeLiveStreams: number;
  viewsByDay: ViewsChartPoint[];
}

export default function DashboardOverviewPage() {
  const { user } = useCurrentUser();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/api/dashboard/stats"),
  });
  const { data: properties } = useQuery<PropertyCardData[]>({
    queryKey: ["dashboard-properties", "recent"],
    queryFn: () => api.get<PropertyCardData[]>("/api/dashboard/properties"),
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-white/50">Here's how your listings are performing.</p>
        </div>
        <Link href="/dashboard/properties/new" className="btn-primary !px-4 !py-2.5 text-sm">
          + Add Property
        </Link>
      </div>

      {isLoading || !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile label="Total properties" value={stats.total} icon={Building2} />
          <StatTile label="Total views" value={stats.totalViews.toLocaleString()} icon={Eye} accent="aurora" />
          <StatTile label="Total favorites" value={stats.totalFavorites} icon={Heart} />
          <StatTile label="Pending viewings" value={stats.pendingViewings} icon={CalendarClock} accent="aurora" />
          <StatTile label="Live now" value={stats.activeLiveStreams} icon={Radio} />
        </div>
      )}

      {stats && (
        <div className="glass-card mt-6 p-5">
          <ViewsChart data={stats.viewsByDay} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">Recent properties</h2>
        <Link href="/dashboard/properties" className="flex items-center gap-1 text-sm text-white/50 hover:text-white">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4">
        <PropertyGrid properties={(properties ?? []).slice(0, 4)} columns={4} />
      </div>
    </div>
  );
}

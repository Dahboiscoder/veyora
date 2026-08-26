"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Flag, Radio, MessageSquare, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api/client";
import { StatTile } from "@/components/dashboard/StatTile";
import { timeAgo } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  totalProperties: number;
  propertiesByStatus: Record<string, number>;
  pendingVerification: number;
  totalCompanies: number;
  pendingReports: number;
  liveNow: number;
  totalMessages: number;
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
  recentReports: { id: string; reason: string; createdAt: string; property: { title: string; slug: string } | null }[];
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminStats>("/api/admin/stats"),
    refetchInterval: 20_000,
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold text-white sm:text-3xl">Platform overview</h1>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <StatTile label="Total users" value={data.totalUsers} icon={Users} accent="aurora" />
          <StatTile label="Properties" value={data.totalProperties} icon={Building2} />
          <StatTile label="Companies" value={data.totalCompanies} icon={Building2} accent="aurora" />
          <StatTile label="Pending verification" value={data.pendingVerification} icon={ShieldAlert} />
          <StatTile label="Open reports" value={data.pendingReports} icon={Flag} accent="aurora" />
          <StatTile label="Live now" value={data.liveNow} icon={Radio} />
        </div>
      )}

      {data && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass-card p-5">
            <p className="mb-3 text-sm font-semibold text-white">Users by role</p>
            <div className="flex flex-col gap-2">
              {Object.entries(data.usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{role}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <p className="mb-3 text-sm font-semibold text-white">Properties by status</p>
            <div className="flex flex-col gap-2">
              {Object.entries(data.propertiesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{status.replace("_", " ")}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Recent signups</p>
              <Link href="/admin/users" className="text-xs text-aurora-400 hover:text-aurora-300">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white/85">{u.name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                  <span className="text-xs text-white/40">{timeAgo(u.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4 text-white/40" /> {data.totalMessages.toLocaleString()} messages sent
              </p>
              <Link href="/admin/reports" className="text-xs text-aurora-400 hover:text-aurora-300">
                View reports
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {data.recentReports.length === 0 ? (
                <p className="text-sm text-white/40">No open reports 🎉</p>
              ) : (
                data.recentReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-white/85">{r.reason.replace("_", " ")}</p>
                      {r.property && <p className="text-xs text-white/40">{r.property.title}</p>}
                    </div>
                    <span className="text-xs text-white/40">{timeAgo(r.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

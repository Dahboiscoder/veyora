"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { cn, timeAgo } from "@/lib/utils";

interface ReportItem {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
  property: { id: string; slug: string; title: string } | null;
  targetUser: { id: string; name: string; email: string } | null;
}

const TABS = ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED", ""];
const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400",
  REVIEWED: "bg-aurora-500/15 text-aurora-400",
  RESOLVED: "bg-green-500/15 text-green-400",
  DISMISSED: "bg-white/10 text-white/40",
};

export default function AdminReportsPage() {
  const [status, setStatus] = useState("PENDING");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ReportItem[]>({
    queryKey: ["admin-reports", status],
    queryFn: () => api.get<ReportItem[]>(`/api/admin/reports${status ? `?status=${status}` : ""}`),
  });

  async function update(id: string, newStatus: string) {
    try {
      await api.patch(`/api/admin/reports/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update report");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Reports</h1>

      <div className="mb-4 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t || "all"}
            onClick={() => setStatus(t)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              status === t ? "bg-aurora-500 text-void-950" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
            )}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Flag className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">Nothing here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((r) => (
            <div key={r.id} className="glass-card flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{r.reason.replace("_", " ")}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLE[r.status])}>{r.status}</span>
                </div>
                {r.property && (
                  <Link href={`/property/${r.property.slug}`} target="_blank" className="text-xs text-ember-400/80 hover:underline">
                    {r.property.title}
                  </Link>
                )}
                {r.targetUser && <p className="text-xs text-ember-400/80">User: {r.targetUser.name}</p>}
                {r.details && <p className="mt-1.5 text-xs text-white/50">"{r.details}"</p>}
                <p className="mt-1.5 text-[11px] text-white/30">
                  Reported by {r.reporter.name} · {timeAgo(r.createdAt)}
                </p>
              </div>
              {r.status === "PENDING" && (
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => update(r.id, "RESOLVED")} className="rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/25">
                    Resolve
                  </button>
                  <button onClick={() => update(r.id, "DISMISSED")} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/[0.1]">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

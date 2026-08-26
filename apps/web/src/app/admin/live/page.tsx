"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Radio, Square } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { cn, timeAgo } from "@/lib/utils";

interface LiveStreamItem {
  id: string;
  title: string;
  status: string;
  scheduledFor: string | null;
  startedAt: string | null;
  endedAt: string | null;
  currentViewers: number;
  peakViewers: number;
  createdAt: string;
  host: { id: string; name: string; email: string };
  property: { id: string; slug: string; title: string };
}

const TABS = ["LIVE", "SCHEDULED", "ENDED", "CANCELED", ""];
const STATUS_STYLE: Record<string, string> = {
  LIVE: "bg-red-500/15 text-red-400",
  SCHEDULED: "bg-aurora-500/15 text-aurora-400",
  ENDED: "bg-white/10 text-white/40",
  CANCELED: "bg-white/10 text-white/40",
};

export default function AdminLivePage() {
  const [status, setStatus] = useState("LIVE");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<LiveStreamItem[]>({
    queryKey: ["admin-live", status],
    queryFn: () => api.get<LiveStreamItem[]>(`/api/admin/live${status ? `?status=${status}` : ""}`),
  });

  async function forceEnd(id: string) {
    if (!confirm("Force-end this live tour?")) return;
    try {
      await api.patch(`/api/live/${id}`, { status: "ENDED" });
      queryClient.invalidateQueries({ queryKey: ["admin-live"] });
      toast.success("Live tour ended");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't end live tour");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Live tours</h1>

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
          <Radio className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">Nothing here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((s) => (
            <div key={s.id} className="glass-card flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLE[s.status])}>
                    {s.status}
                  </span>
                </div>
                <Link href={`/property/${s.property.slug}`} target="_blank" className="text-xs text-ember-400/80 hover:underline">
                  {s.property.title}
                </Link>
                <p className="mt-1.5 text-[11px] text-white/30">
                  Hosted by {s.host.name} ({s.host.email}) · {timeAgo(s.createdAt)}
                  {s.status === "LIVE" && ` · ${s.currentViewers} watching now`}
                  {s.peakViewers > 0 && ` · peak ${s.peakViewers}`}
                </p>
              </div>
              {s.status === "LIVE" && (
                <button
                  onClick={() => forceEnd(s.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25"
                >
                  <Square className="h-3 w-3" /> End
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

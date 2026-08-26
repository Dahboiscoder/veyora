"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Radio, Users, Square } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface LiveStreamItem {
  id: string;
  title: string;
  status: string;
  currentViewers: number;
  peakViewers: number;
  scheduledFor: string | null;
  property: { slug: string; title: string; media: { url: string }[] };
}

const STATUS_STYLE: Record<string, string> = {
  LIVE: "bg-red-500/15 text-red-400",
  SCHEDULED: "bg-aurora-500/15 text-aurora-400",
  ENDED: "bg-white/10 text-white/50",
  CANCELED: "bg-white/5 text-white/30",
};

export default function DashboardLivePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<LiveStreamItem[]>({
    queryKey: ["live", "mine"],
    queryFn: () => api.get<LiveStreamItem[]>("/api/live?mine=true"),
  });

  async function endStream(id: string) {
    try {
      await api.patch(`/api/live/${id}`, { status: "ENDED" });
      queryClient.invalidateQueries({ queryKey: ["live", "mine"] });
      toast.success("Live tour ended");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't end tour");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Live tours</h1>
        <Link href="/dashboard/properties" className="btn-primary !bg-red-500 !from-red-500 !to-red-500 !px-4 !py-2.5 text-sm">
          <Radio className="h-4 w-4" /> Start a tour
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Radio className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">You haven't hosted a live tour yet.</p>
          <p className="mt-1 text-xs text-white/30">Go to a published property and hit "Go Live" to start one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((stream) => (
            <div key={stream.id} className="glass-card flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                {stream.property.media[0] && <Image src={stream.property.media[0].url} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={stream.status === "LIVE" ? `/live/${stream.id}` : `/property/${stream.property.slug}`} className="text-sm font-semibold text-white hover:underline">
                  {stream.title}
                </Link>
                {stream.status === "LIVE" && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/45">
                    <Users className="h-3 w-3" /> {stream.currentViewers} watching now · peak {stream.peakViewers}
                  </p>
                )}
                {stream.scheduledFor && stream.status === "SCHEDULED" && (
                  <p className="mt-0.5 text-xs text-white/45">Scheduled for {new Date(stream.scheduledFor).toLocaleString()}</p>
                )}
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLE[stream.status])}>{stream.status}</span>
              {stream.status === "LIVE" && (
                <button onClick={() => endStream(stream.id)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/[0.1]">
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

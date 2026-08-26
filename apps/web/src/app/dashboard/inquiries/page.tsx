"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { api, ApiError } from "@/lib/api/client";
import { initials, cn } from "@/lib/utils";

interface ViewingItem {
  id: string;
  status: string;
  proposedAt: string;
  message: string | null;
  property: { id: string; slug: string; title: string; city: { name: string } };
  requester: { id: string; name: string; avatarUrl: string | null };
}

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: "bg-yellow-500/15 text-yellow-400",
  CONFIRMED: "bg-green-500/15 text-green-400",
  DECLINED: "bg-red-500/15 text-red-400",
  COMPLETED: "bg-white/10 text-white/50",
  CANCELED: "bg-white/5 text-white/30",
};

export default function InquiriesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<ViewingItem[]>({
    queryKey: ["viewings", "host"],
    queryFn: () => api.get<ViewingItem[]>("/api/viewings?as=host"),
  });

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/viewings/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["viewings", "host"] });
      toast.success(`Viewing ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update viewing");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Viewing requests</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <CalendarClock className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No viewing requests yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((v) => (
            <div key={v.id} className="glass-card flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold">
                {v.requester.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.requester.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(v.requester.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{v.requester.name}</p>
                <Link href={`/property/${v.property.slug}`} className="text-xs text-ember-400/80 hover:underline">
                  {v.property.title}
                </Link>
                <p className="mt-0.5 text-xs text-white/40">
                  Requested {new Date(v.proposedAt).toLocaleString()} · {formatDistanceToNow(new Date(v.proposedAt), { addSuffix: true })}
                </p>
                {v.message && <p className="mt-1 text-xs text-white/50">"{v.message}"</p>}
              </div>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLE[v.status])}>{v.status}</span>
              {v.status === "REQUESTED" && (
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => updateStatus(v.id, "CONFIRMED")} className="grid h-10 w-10 place-items-center rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => updateStatus(v.id, "DECLINED")} className="grid h-10 w-10 place-items-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25">
                    <X className="h-4 w-4" />
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

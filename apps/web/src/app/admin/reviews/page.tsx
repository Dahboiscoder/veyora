"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { cn, timeAgo } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  property: { id: string; slug: string; title: string } | null;
  agent: { id: string; name: string } | null;
  company: { id: string; name: string } | null;
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["admin-reviews"],
    queryFn: () => api.get<ReviewItem[]>("/api/admin/reviews"),
  });

  async function remove(id: string) {
    if (!confirm("Delete this review? This can't be undone.")) return;
    try {
      await api.del(`/api/admin/reviews/${id}`);
      queryClient.setQueryData<ReviewItem[]>(["admin-reviews"], (prev) => prev?.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete review");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Reviews</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Star className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No reviews yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((r) => {
            const target = r.property?.title ?? r.agent?.name ?? r.company?.name ?? "Unknown target";
            return (
              <div key={r.id} className="glass-card flex flex-wrap items-start gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn("h-3.5 w-3.5", i < r.rating ? "fill-ember-400 text-ember-400" : "text-white/20")}
                      />
                    ))}
                    <span className="ml-1 text-xs text-white/40">on {target}</span>
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-white/70">"{r.comment}"</p>}
                  <p className="mt-1.5 text-[11px] text-white/30">
                    {r.author.name} ({r.author.email}) · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => remove(r.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@nyumba/shared";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "@/types/property";

const STATUS_TABS = ["", "PENDING_REVIEW", "PUBLISHED", "DRAFT", "SOLD", "RENTED", "ARCHIVED", "REJECTED"];

const VERIFICATION_STYLE: Record<string, string> = {
  VERIFIED: "bg-green-500/15 text-green-400",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  UNVERIFIED: "bg-white/10 text-white/50",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default function AdminPropertiesPage() {
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PropertyCardData[]>({
    queryKey: ["admin-properties", status],
    queryFn: () => api.get<PropertyCardData[]>(`/api/admin/properties${status ? `?status=${status}` : ""}`),
  });

  async function update(id: string, body: Record<string, unknown>) {
    try {
      await api.patch(`/api/admin/properties/${id}`, body);
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast.success("Property updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update property");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Properties</h1>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              status === s ? "bg-aurora-500 text-void-950" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
            )}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <Link href={`/property/${p.slug}`} target="_blank" className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {p.media[0] && <Image src={p.media[0].url} alt="" fill sizes="64px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/property/${p.slug}`} target="_blank" className="line-clamp-1 text-sm font-semibold text-white hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-white/40">
                    {formatPrice(p.price, p.currencyCode, p.priceNote)} · {p.city.name} · by {p.owner.name}
                  </p>
                </div>
                <span className="chip">{p.status.replace("_", " ")}</span>
                <select
                  value={p.verificationStatus}
                  onChange={(e) => update(p.id, { verificationStatus: e.target.value })}
                  className={cn("rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold outline-none", VERIFICATION_STYLE[p.verificationStatus])}
                >
                  <option value="UNVERIFIED">Unverified</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                {p.status === "PENDING_REVIEW" && (
                  <div className="flex gap-1.5">
                    <button onClick={() => update(p.id, { status: "PUBLISHED" })} className="rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold text-green-400 hover:bg-green-500/25">
                      Approve
                    </button>
                    <button onClick={() => update(p.id, { status: "REJECTED" })} className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/25">
                      Reject
                    </button>
                  </div>
                )}
                <button
                  onClick={() => update(p.id, { isFeatured: !p.isFeatured })}
                  className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", p.isFeatured ? "bg-ember-500/20 text-ember-300" : "bg-white/[0.04] text-white/40")}
                >
                  <Sparkles className="h-3 w-3" /> Featured
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

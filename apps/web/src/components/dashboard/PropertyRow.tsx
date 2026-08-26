"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Heart, MoreVertical, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@nyumba/shared";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "@/types/property";

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-green-500/15 text-green-400",
  DRAFT: "bg-white/10 text-white/60",
  PENDING_REVIEW: "bg-yellow-500/15 text-yellow-400",
  SOLD: "bg-aurora-500/15 text-aurora-400",
  RENTED: "bg-aurora-500/15 text-aurora-400",
  ARCHIVED: "bg-white/5 text-white/30",
  REJECTED: "bg-red-500/15 text-red-400",
};

const NEXT_STATUSES: Record<string, { value: string; label: string }[]> = {
  DRAFT: [{ value: "PUBLISHED", label: "Publish" }],
  PUBLISHED: [
    { value: "SOLD", label: "Mark sold" },
    { value: "RENTED", label: "Mark rented" },
    { value: "ARCHIVED", label: "Archive" },
    { value: "DRAFT", label: "Unpublish" },
  ],
  SOLD: [{ value: "PUBLISHED", label: "Republish" }],
  RENTED: [{ value: "PUBLISHED", label: "Republish" }],
  ARCHIVED: [{ value: "PUBLISHED", label: "Republish" }],
  PENDING_REVIEW: [],
  REJECTED: [{ value: "DRAFT", label: "Move to draft" }],
};

export function PropertyRow({ property, onChanged }: { property: PropertyCardData; onChanged: () => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const image = property.media[0];

  async function setStatus(status: string) {
    setBusy(true);
    try {
      const result = await api.patch<{ possibleDuplicateOf: string | null }>(`/api/properties/${property.id}/status`, {
        status,
      });
      toast.success("Status updated");
      if (result.possibleDuplicateOf) {
        toast.info("This listing looks similar to another one of yours — flagged for admin review.");
      }
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update status");
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${property.title}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await api.del(`/api/properties/${property.id}`);
      toast.success("Property deleted");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete property");
    } finally {
      setBusy(false);
    }
  }

  async function startLive() {
    setBusy(true);
    try {
      const stream = await api.post<{ id: string }>("/api/live", { propertyId: property.id, title: `Live tour: ${property.title}` });
      router.push(`/live/${stream.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start live tour");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4 border-b border-white/5 py-4 last:border-0">
      <Link href={`/property/${property.slug}`} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
        {image && <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/property/${property.slug}`} className="line-clamp-1 text-sm font-semibold text-white hover:underline">
          {property.title}
        </Link>
        <p className="mt-0.5 text-xs text-white/45">
          {formatPrice(property.price, property.currencyCode, property.priceNote)} · {property.city.name}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/40">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {property.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {property._count.favorites}
          </span>
        </div>
      </div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLE[property.status])}>
        {property.status.replace("_", " ")}
      </span>
      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          disabled={busy}
          className="grid h-9 w-9 place-items-center rounded-full text-white/50 hover:bg-white/[0.06] disabled:opacity-40"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-xl border border-white/10 bg-void-900 py-1.5 shadow-xl">
            <Link href={`/dashboard/properties/${property.id}/edit`} className="block px-3.5 py-2 text-sm text-white/80 hover:bg-white/[0.06]">
              Edit
            </Link>
            {property.status === "PUBLISHED" && (
              <button onClick={startLive} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-white/80 hover:bg-white/[0.06]">
                <Radio className="h-3.5 w-3.5" /> Start live tour
              </button>
            )}
            {NEXT_STATUSES[property.status]?.map((s) => (
              <button key={s.value} onClick={() => setStatus(s.value)} className="block w-full px-3.5 py-2 text-left text-sm text-white/80 hover:bg-white/[0.06]">
                {s.label}
              </button>
            ))}
            <button onClick={remove} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

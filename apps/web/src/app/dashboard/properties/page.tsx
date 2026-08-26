"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, PlusCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { PropertyRow } from "@/components/dashboard/PropertyRow";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "@/types/property";

const TABS = [
  { value: "", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "SOLD", label: "Sold" },
  { value: "RENTED", label: "Rented" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function DashboardPropertiesPage() {
  const [tab, setTab] = useState("");
  const { data, isLoading, refetch } = useQuery<PropertyCardData[]>({
    queryKey: ["dashboard-properties", tab],
    queryFn: () => api.get<PropertyCardData[]>(`/api/dashboard/properties${tab ? `?status=${tab}` : ""}`),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-white">Your properties</h1>
        <Link href="/dashboard/properties/new" className="btn-primary !px-4 !py-2.5 text-sm">
          <PlusCircle className="h-4 w-4" /> Add Property
        </Link>
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              tab === t.value ? "bg-ember-500 text-white" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card px-5">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          data.map((property) => <PropertyRow key={property.id} property={property} onChanged={refetch} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">No properties in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

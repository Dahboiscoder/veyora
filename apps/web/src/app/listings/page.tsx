"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, Map as MapIcon, List, X, Search } from "lucide-react";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { SortSelect } from "@/components/listings/SortSelect";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { Pagination } from "@/components/listings/Pagination";
import { Drawer } from "@/components/ui/Drawer";
import { describeAppliedFilters } from "@/lib/properties/describeFilters";
import { cn } from "@/lib/utils";

const PropertyMap = dynamic(() => import("@/components/map/PropertyMap").then((m) => m.PropertyMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />,
});

function ListingsPageInner() {
  const { filters, setFilters, clearFilters, data, isLoading, isFetching } = usePropertySearch();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const properties = data?.items ?? [];
  const activeFilterCount = Object.keys(filters).filter((k) => k !== "page" && k !== "sort").length;
  const searchChips = describeAppliedFilters(data?.appliedFilters);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {filters.q && (
        <div className="glass-card mb-6 flex flex-wrap items-center gap-2 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <p className="text-sm text-white/70">
            Searching for <span className="font-medium text-white">"{filters.q}"</span>
          </p>
          {searchChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {searchChips.map((chip) => (
                <span key={chip} className="chip !cursor-default text-[11px]">
                  {chip}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setFilters({ q: undefined }, { resetPage: false })}
            className="ml-auto flex shrink-0 items-center gap-1 text-xs text-white/40 hover:text-white"
          >
            <X className="h-3.5 w-3.5" /> Clear search
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {isLoading ? "Searching…" : `${data?.total ?? 0} properties`}
          </h1>
          <p className="mt-1 text-sm text-white/50">Across 11 African countries, updated daily.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFiltersOpen(true)} className="btn-secondary !px-4 !py-2.5 text-sm lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <SortSelect value={filters.sort} onChange={setFilters} />
          <button
            onClick={() => setShowMap((v) => !v)}
            className={cn("btn-secondary !px-4 !py-2.5 text-sm", showMap && "!bg-ember-500/20 !text-ember-300")}
          >
            {showMap ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 gap-8", showMap ? "lg:grid-cols-[280px_minmax(0,1fr)_480px]" : "lg:grid-cols-[280px_minmax(0,1fr)]")}>
        <aside className="hidden lg:block">
          <div className="sticky top-24 glass-card p-5">
            <FilterPanel filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
          </div>
        </aside>

        <div className={cn(showMap && "hidden lg:block")}>
          <PropertyGrid
            properties={properties}
            isLoading={isLoading}
            columns={showMap ? 2 : 3}
            emptyTitle={filters.q ? "No properties match that search" : undefined}
            emptyDescription={
              filters.q
                ? "Try a broader search — fewer specifics, or just a location — and we'll widen the results."
                : undefined
            }
            emptyAction={
              activeFilterCount > 0 && (
                <button onClick={clearFilters} className="btn-secondary !px-4 !py-2 text-xs">
                  Clear search & filters
                </button>
              )
            }
          />
          {data && (
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(page) => setFilters({ page }, { resetPage: false })} />
          )}
        </div>

        {showMap && (
          <div className="h-[70svh] lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)]">
            <PropertyMap properties={properties} height="100%" />
          </div>
        )}
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-semibold">Filters</p>
          <button onClick={() => setFiltersOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <FilterPanel filters={filters} setFilters={setFilters} clearFilters={clearFilters} onClose={() => setFiltersOpen(false)} />
        <button onClick={() => setFiltersOpen(false)} className="btn-primary mt-4 w-full">
          Show {isFetching ? "…" : data?.total ?? 0} results
        </button>
      </Drawer>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsPageInner />
    </Suspense>
  );
}

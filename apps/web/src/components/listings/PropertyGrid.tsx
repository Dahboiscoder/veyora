import { SearchX } from "lucide-react";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/PropertyCard";
import type { PropertyCardData } from "@/types/property";

export function PropertyGrid({
  properties,
  isLoading,
  columns = 3,
  emptyTitle = "No properties match your filters",
  emptyDescription = "Try widening your price range or clearing a few filters.",
  emptyAction,
}: {
  properties: PropertyCardData[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  const gridCols = columns === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3";

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-5 ${gridCols}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
        <SearchX className="mb-4 h-10 w-10 text-white/20" />
        <p className="font-display text-lg font-semibold text-white">{emptyTitle}</p>
        <p className="mt-1 text-sm text-white/50">{emptyDescription}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-5 ${gridCols}`}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

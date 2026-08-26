"use client";

import { SORT_OPTIONS } from "@nyumba/shared";
import type { SearchFilters } from "@/hooks/usePropertySearch";

export function SortSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (next: SearchFilters) => void;
}) {
  return (
    <select
      value={value ?? "recommended"}
      onChange={(e) => onChange({ sort: e.target.value })}
      className="input w-auto py-2.5 text-sm"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          Sort: {opt.label}
        </option>
      ))}
    </select>
  );
}

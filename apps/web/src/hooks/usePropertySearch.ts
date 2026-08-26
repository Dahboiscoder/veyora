"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PropertySearchResponse } from "@/types/property";

export interface SearchFilters {
  q?: string;
  category?: string;
  type?: string;
  listingType?: string;
  countryCode?: string;
  cityId?: string;
  cityName?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: string;
  amenities?: string[];
  verifiedOnly?: boolean;
  has3DTour?: boolean;
  hasVideo?: boolean;
  isLive?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
}

const ARRAY_KEYS = new Set(["amenities"]);
const BOOL_KEYS = new Set(["verifiedOnly", "has3DTour", "hasVideo", "isLive"]);
const NUMBER_KEYS = new Set(["minPrice", "maxPrice", "bedrooms", "bathrooms", "page"]);

export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (ARRAY_KEYS.has(key) && Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}

function searchParamsToFilters(params: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {};
  for (const key of params.keys()) {
    if (ARRAY_KEYS.has(key)) {
      (filters as any)[key] = params.getAll(key);
    } else if (NUMBER_KEYS.has(key)) {
      (filters as any)[key] = Number(params.get(key));
    } else if (BOOL_KEYS.has(key)) {
      (filters as any)[key] = params.get(key) === "true";
    } else {
      (filters as any)[key] = params.get(key);
    }
  }
  return filters;
}

/** Keeps property search filters synced to the URL (shareable/bookmarkable) and fetches results via react-query. */
export function usePropertySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => searchParamsToFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (next: SearchFilters, { resetPage = true }: { resetPage?: boolean } = {}) => {
      const merged: SearchFilters = { ...filters, ...next };
      if (resetPage) merged.page = 1;
      const params = filtersToSearchParams(merged);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, pathname, router]
  );

  const clearFilters = useCallback(() => router.push(pathname, { scroll: false }), [pathname, router]);

  const queryString = useMemo(() => filtersToSearchParams({ ...filters, pageSize: 24 }).toString(), [filters]);

  const query = useQuery<PropertySearchResponse>({
    queryKey: ["properties", queryString],
    queryFn: () => api.get<PropertySearchResponse>(`/api/properties?${queryString}`),
    placeholderData: keepPreviousData,
  });

  return { filters, setFilters, clearFilters, ...query };
}

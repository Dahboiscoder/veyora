"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface CountryWithCities {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
  currencyCode: string;
  currencySymbol: string;
  cities: { id: string; name: string; lat: number | null; lng: number | null }[];
}

export function useCountries() {
  const query = useQuery<CountryWithCities[]>({
    queryKey: ["countries"],
    queryFn: () => api.get<CountryWithCities[]>("/api/countries"),
    staleTime: 10 * 60_000,
  });
  return {
    countries: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

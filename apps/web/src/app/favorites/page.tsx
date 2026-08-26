"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { api } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import type { PropertyCardData } from "@/types/property";

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !isAuthenticated) router.push("/login?redirect=/favorites");
  }, [userLoading, isAuthenticated, router]);

  const { data, isLoading } = useQuery<PropertyCardData[]>({
    queryKey: ["favorites"],
    queryFn: () => api.get<PropertyCardData[]>("/api/favorites"),
    enabled: isAuthenticated,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-6 w-6 text-ember-400" />
        <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Saved properties</h1>
      </div>
      <PropertyGrid properties={data ?? []} isLoading={isLoading} columns={4} />
    </div>
  );
}

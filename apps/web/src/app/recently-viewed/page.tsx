"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { api } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import type { PropertyCardData } from "@/types/property";

export default function RecentlyViewedPage() {
  const { isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !isAuthenticated) router.push("/login?redirect=/recently-viewed");
  }, [userLoading, isAuthenticated, router]);

  const { data, isLoading } = useQuery<PropertyCardData[]>({
    queryKey: ["recently-viewed"],
    queryFn: () => api.get<PropertyCardData[]>("/api/properties/recently-viewed"),
    enabled: isAuthenticated,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <History className="h-6 w-6 text-ember-400" />
        <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Recently viewed</h1>
      </div>
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-white/50">Properties you view will show up here.</p>
      ) : (
        <PropertyGrid properties={data ?? []} isLoading={isLoading} columns={4} />
      )}
    </div>
  );
}

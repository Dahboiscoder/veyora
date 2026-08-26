"use client";

import { useQuery } from "@tanstack/react-query";
import { CAN_LIST_ROLES } from "@nyumba/shared";
import { api, ApiError } from "@/lib/api/client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "OWNER" | "AGENT" | "COMPANY" | "ADMIN";
  companyId: string | null;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  countryId: string | null;
}

export function useCurrentUser() {
  const query = useQuery<SessionUser | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await api.get<SessionUser>("/api/auth/me");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    refetch: query.refetch,
  };
}

export const CAN_LIST_PROPERTIES = CAN_LIST_ROLES;

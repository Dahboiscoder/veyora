"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

export function FollowCompanyButton({ companyId }: { companyId: string }) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!isAuthenticated) return router.push("/login");
    setPending(true);
    try {
      const res = await api.post<{ following: boolean }>(`/api/companies/${companyId}/follow`);
      setFollowing(res.following);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update follow status");
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={toggle} disabled={pending} className={cn("shrink-0", following ? "btn-secondary" : "btn-primary", "!px-4 !py-2 text-sm")}>
      {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}

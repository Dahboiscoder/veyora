"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { initials, cn, timeAgo } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: string;
  company: { id: string; name: string } | null;
  _count: { properties: number };
}

const ROLES = ["", "USER", "OWNER", "AGENT", "COMPANY", "ADMIN"];

const VERIFICATION_STYLE: Record<string, string> = {
  VERIFIED: "bg-green-500/15 text-green-400",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  UNVERIFIED: "bg-white/10 text-white/50",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default function AdminUsersPage() {
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users", role, q],
    queryFn: () => api.get<AdminUser[]>(`/api/admin/users?${role ? `role=${role}&` : ""}${q ? `q=${encodeURIComponent(q)}` : ""}`),
  });

  async function updateUser(id: string, body: Record<string, unknown>) {
    try {
      await api.patch(`/api/admin/users/${id}`, body);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update user");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Users</h1>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="input w-64 pl-9" />
        </div>
        <div className="flex gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                role === r ? "bg-aurora-500 text-void-950" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
              )}
            >
              {r || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                  {initials(u.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-white/40">{u.email}</p>
                </div>
                <span className="chip">{u.role}</span>
                {u.company && <span className="chip">{u.company.name}</span>}
                <span className="text-xs text-white/30">{u._count.properties} listings</span>
                <select
                  value={u.verificationStatus}
                  onChange={(e) => updateUser(u.id, { verificationStatus: e.target.value })}
                  className={cn("rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold outline-none", VERIFICATION_STYLE[u.verificationStatus])}
                >
                  <option value="UNVERIFIED">Unverified</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                  className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", u.isActive ? "bg-white/10 text-white/60" : "bg-red-500/15 text-red-400")}
                >
                  {u.isActive ? "Active" : "Suspended"}
                </button>
                <span className="w-full shrink-0 text-[11px] text-white/25 sm:w-auto">{timeAgo(u.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { api } from "@/lib/api/client";
import { cn, timeAgo } from "@/lib/utils";
import { formatPrice } from "@nyumba/shared";

interface PaymentItem {
  id: string;
  amount: string;
  currencyCode: string;
  purpose: string;
  status: string;
  provider: string;
  providerRef: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const TABS = ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED", ""];
const STATUS_STYLE: Record<string, string> = {
  SUCCEEDED: "bg-green-500/15 text-green-400",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  FAILED: "bg-red-500/15 text-red-400",
  REFUNDED: "bg-white/10 text-white/40",
};

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState("SUCCEEDED");

  const { data, isLoading } = useQuery<PaymentItem[]>({
    queryKey: ["admin-payments", status],
    queryFn: () => api.get<PaymentItem[]>(`/api/admin/payments${status ? `?status=${status}` : ""}`),
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Payments</h1>

      <div className="mb-4 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t || "all"}
            onClick={() => setStatus(t)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              status === t ? "bg-aurora-500 text-void-950" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
            )}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No payments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{p.user.name}</p>
                    <p className="text-xs text-white/40">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.purpose.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-white/70">{formatPrice(p.amount, p.currencyCode)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLE[p.status])}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">{timeAgo(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

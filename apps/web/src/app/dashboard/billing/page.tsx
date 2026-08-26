"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Sparkles } from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: string;
  currencyCode: string;
  purpose: string;
  status: string;
  createdAt: string;
}
interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
}

const STATUS_STYLE: Record<string, string> = {
  SUCCEEDED: "bg-green-500/15 text-green-400",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  FAILED: "bg-red-500/15 text-red-400",
  REFUNDED: "bg-white/10 text-white/50",
};

export default function BillingPage() {
  const { data, isLoading } = useQuery<{ payments: Payment[]; subscription: Subscription | null }>({
    queryKey: ["billing"],
    queryFn: () => api.get("/api/payments/history"),
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-white">Billing</h1>

      <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs text-white/40">Current plan</p>
          <p className="mt-1 flex items-center gap-2 font-display text-xl font-semibold text-white">
            {data?.subscription?.plan ?? "Free"}
            {data?.subscription?.plan && data.subscription.plan !== "FREE" && <Sparkles className="h-4 w-4 text-ember-400" />}
          </p>
        </div>
        <Link href="/pricing" className="btn-primary !px-4 !py-2 text-sm">
          {data?.subscription?.plan && data.subscription.plan !== "FREE" ? "Change plan" : "Upgrade plan"}
        </Link>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-white">Payment history</h2>
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.payments.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-14 text-center">
          <CreditCard className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No payments yet.</p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-white/5 overflow-hidden">
          {data.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm text-white/85">{p.purpose.replace(/_/g, " ")}</p>
                <p className="text-xs text-white/35">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">
                  ${Number(p.amount).toFixed(2)} {p.currencyCode}
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLE[p.status])}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

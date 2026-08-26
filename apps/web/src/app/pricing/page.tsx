"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    description: "Everything you need to start listing.",
    features: ["Up to 3 active listings", "Standard search placement", "Basic messaging", "Community support"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$19",
    description: "For active agents who want more reach.",
    features: ["Unlimited listings", "Priority search placement", "Live tour hosting", "Verified agent badge", "Analytics dashboard"],
    highlighted: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: "$79",
    description: "For agencies managing a team of agents.",
    features: ["Everything in Pro", "Unlimited team seats", "Company profile & branding", "Bulk listing tools", "Priority support"],
  },
];

export default function PricingPage() {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function upgrade(plan: string) {
    if (plan === "FREE") return;
    if (!isAuthenticated) return router.push("/register?role=AGENT");
    setLoadingPlan(plan);
    try {
      const res = await api.post<{ url: string }>("/api/payments/checkout/subscription", { plan });
      window.location.href = res.url;
    } catch (err) {
      if (err instanceof ApiError && err.status === 501) {
        toast.info("Payments aren't configured in this environment yet — add a Stripe secret key to enable checkout.");
      } else {
        toast.error(err instanceof ApiError ? err.message : "Couldn't start checkout");
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <p className="section-label mb-2">Pricing</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white">Grow your reach on VEYORA</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/50">
          List for free, or upgrade for priority placement, live tours, and unlimited listings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              plan.highlighted ? "border-ember-500/50 bg-gradient-to-b from-ember-500/10 to-transparent" : "border-white/10 bg-void-900/50"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-8 flex items-center gap-1 rounded-full bg-ember-500 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3" /> Most popular
              </span>
            )}
            <h2 className="font-display text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-white/50">{plan.description}</p>
            <p className="mt-6 font-display text-4xl font-bold text-white">
              {plan.price}
              {plan.id !== "FREE" && <span className="text-base font-normal text-white/40">/month</span>}
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 shrink-0 text-ember-400" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => upgrade(plan.id)}
              disabled={loadingPlan === plan.id}
              className={plan.highlighted ? "btn-primary mt-8 w-full" : "btn-secondary mt-8 w-full"}
            >
              {loadingPlan === plan.id ? "Redirecting…" : plan.id === "FREE" ? "Get started" : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-md text-center text-xs text-white/30">
        Featured listing promotion is priced separately at $2/day and can be purchased from any property's
        dashboard page.
      </p>
    </div>
  );
}

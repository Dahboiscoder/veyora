import Stripe from "stripe";
import { env } from "@/lib/env";

let client: Stripe | null = null;

export function isPaymentsConfigured(): boolean {
  return env.stripeSecretKey.length > 0;
}

/** Throws a clear, catchable error rather than a cryptic Stripe SDK crash when no key is configured — the expected state for local dev. */
export function getStripe(): Stripe {
  if (!isPaymentsConfigured()) {
    throw new PaymentsNotConfiguredError();
  }
  if (!client) {
    client = new Stripe(env.stripeSecretKey, { apiVersion: "2024-06-20" });
  }
  return client;
}

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("Payments are not configured in this environment. Set STRIPE_SECRET_KEY to enable checkout.");
  }
}

// Plan pricing lives here, not scattered across routes — swap for real
// Stripe Price IDs (STRIPE_PRICE_PRO / STRIPE_PRICE_BUSINESS env vars) once
// a live Stripe account exists; falls back to inline `price_data` so
// checkout still works before those are configured.
export const SUBSCRIPTION_PLANS = {
  PRO: { label: "Pro", monthlyUsd: 19, priceId: process.env.STRIPE_PRICE_PRO },
  BUSINESS: { label: "Business", monthlyUsd: 79, priceId: process.env.STRIPE_PRICE_BUSINESS },
} as const;

export const FEATURED_LISTING_USD_PER_DAY = 2;

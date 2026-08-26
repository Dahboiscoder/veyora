// Client-safe env accessor: only NEXT_PUBLIC_* values, which Next.js
// inlines into the browser bundle at build time. Never import the
// server-side `env.ts` (DB url, JWT/Stripe secrets) from a "use client"
// file — this module exists specifically to keep that boundary clean.
export const clientEnv = {
  realtimeUrl: process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:4001",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  mapStyleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/liberty",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

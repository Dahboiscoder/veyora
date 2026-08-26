import { env } from "@/lib/env";

const REALTIME_INTERNAL_URL = (process.env.REALTIME_INTERNAL_URL ?? "http://localhost:4001").replace(/\/$/, "");

async function post(path: string, body: unknown) {
  try {
    await fetch(`${REALTIME_INTERNAL_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": env.realtimeInternalSecret },
      body: JSON.stringify(body),
    });
  } catch {
    // Realtime service unreachable — the DB write already succeeded, so we
    // degrade to "viewers see it on next poll/reload" rather than failing
    // the request over a best-effort push notification.
  }
}

export const realtimeInternal = {
  notifyUser: (userId: string, notification: { type: string; title: string; body?: string; data?: unknown }) =>
    post("/internal/notify", { userId, notification }),
  liveStatus: (streamId: string, status: string) => post(`/internal/live/${streamId}/status`, { status }),
};

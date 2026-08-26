export const env = {
  port: Number(process.env.REALTIME_PORT ?? 4001),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-insecure-access-secret-change-me",
  webOrigin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  internalSecret: process.env.REALTIME_INTERNAL_SECRET ?? "dev-insecure-internal-secret-change-me",
  cookieName: "nyumba_at",
};

// Mirrors apps/web's guard: refuse to boot with placeholder secrets once
// this is actually deployed, so a missing env var fails loudly instead of
// silently accepting connections signed with a well-known dev secret.
export function assertSafeToRunInProduction() {
  if (process.env.NODE_ENV !== "production") return;
  const unsafe: string[] = [];
  if (env.jwtAccessSecret.startsWith("dev-insecure")) unsafe.push("JWT_ACCESS_SECRET");
  if (env.internalSecret.startsWith("dev-insecure")) unsafe.push("REALTIME_INTERNAL_SECRET");
  if (unsafe.length > 0) {
    throw new Error(
      `Refusing to start in production with development default secrets: ${unsafe.join(", ")}`
    );
  }
}

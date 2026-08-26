export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { assertSafeToRunInProduction } = await import("@/lib/env");
  assertSafeToRunInProduction();
}

function readEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== "") return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

const isProd = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd,

  databaseUrl: readEnv(
    "DATABASE_URL",
    "postgresql://nyumba:nyumba_dev_password@localhost:5432/nyumba"
  ),

  jwtAccessSecret: readEnv("JWT_ACCESS_SECRET", "dev-insecure-access-secret-change-me"),
  jwtRefreshSecret: readEnv("JWT_REFRESH_SECRET", "dev-insecure-refresh-secret-change-me"),
  jwtAccessTtl: readEnv("JWT_ACCESS_TTL", "15m"),
  jwtRefreshTtl: readEnv("JWT_REFRESH_TTL", "30d"),
  jwtRefreshTtlMs: 30 * 24 * 60 * 60 * 1000,

  s3: {
    endpoint: readEnv("S3_ENDPOINT", "http://localhost:9000"),
    publicBaseUrl: readEnv("S3_PUBLIC_BASE_URL", "http://localhost:9000/media"),
    region: readEnv("S3_REGION", "us-east-1"),
    accessKeyId: readEnv("S3_ACCESS_KEY_ID", "nyumba"),
    secretAccessKey: readEnv("S3_SECRET_ACCESS_KEY", "nyumba_dev_password"),
    bucket: readEnv("S3_BUCKET", "media"),
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") === "true",
  },

  realtimeUrl: readEnv("NEXT_PUBLIC_REALTIME_URL", "http://localhost:4001"),
  realtimeInternalSecret: readEnv("REALTIME_INTERNAL_SECRET", "dev-insecure-internal-secret-change-me"),
  appUrl: readEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  mapStyleUrl: readEnv(
    "NEXT_PUBLIC_MAP_STYLE_URL",
    "https://tiles.openfreemap.org/styles/liberty"
  ),

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

// Mirrors the "refuse to boot with placeholder secrets in prod" pattern —
// cheap insurance against shipping dev defaults by accident.
export function assertSafeToRunInProduction() {
  if (!isProd) return;
  const unsafe: string[] = [];
  if (env.jwtAccessSecret.startsWith("dev-insecure")) unsafe.push("JWT_ACCESS_SECRET");
  if (env.jwtRefreshSecret.startsWith("dev-insecure")) unsafe.push("JWT_REFRESH_SECRET");
  if (unsafe.length > 0) {
    throw new Error(
      `Refusing to start in production with development default secrets: ${unsafe.join(", ")}`
    );
  }
}

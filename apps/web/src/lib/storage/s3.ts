import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;
  client = new S3Client({
    endpoint: env.s3.endpoint,
    region: env.s3.region,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
  });
  return client;
}

export function publicUrlForKey(key: string): string {
  return `${env.s3.publicBaseUrl.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

/**
 * Returns a short-lived presigned PUT URL the browser can upload directly
 * to (bypassing our API for the actual bytes), plus the public URL the
 * object will be reachable at once uploaded. Works against MinIO locally
 * and drops in against real S3 / Cloudflare R2 in production by swapping
 * S3_ENDPOINT / credentials — no code change needed.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  return { uploadUrl, publicUrl: publicUrlForKey(key), key };
}

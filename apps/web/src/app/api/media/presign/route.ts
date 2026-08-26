import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { createPresignedUploadUrl } from "@/lib/storage/s3";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream", // .glb often reports as this from browser file inputs
  "application/pdf",
];

const bodySchema = z.object({
  context: z.enum(["property", "avatar", "company"]),
  propertyId: z.string().optional(),
  companyId: z.string().optional(),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1),
});

function safeName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = bodySchema.parse(await req.json());

  if (!ALLOWED_CONTENT_TYPES.includes(body.contentType)) {
    return jsonError(`Unsupported content type: ${body.contentType}`, 415);
  }

  let folder: string;

  if (body.context === "avatar") {
    folder = `avatars/${user.id}`;
  } else if (body.context === "company") {
    if (!body.companyId) return jsonError("companyId is required", 422);
    const company = await prisma.company.findUnique({ where: { id: body.companyId } });
    if (!company) return jsonError("Company not found", 404);
    if (user.role !== "ADMIN" && company.ownerId !== user.id) {
      return jsonError("You cannot upload media for this company", 403);
    }
    folder = `companies/${body.companyId}`;
  } else {
    if (!body.propertyId) return jsonError("propertyId is required", 422);
    const property = await prisma.property.findUnique({ where: { id: body.propertyId } });
    if (!property) return jsonError("Property not found", 404);
    const isManager =
      user.role === "ADMIN" || user.id === property.ownerId || (property.companyId && user.companyId === property.companyId);
    if (!isManager) return jsonError("You cannot upload media for this property", 403);
    folder = `properties/${body.propertyId}`;
  }

  const key = `${folder}/${nanoid(10)}-${safeName(body.filename)}`;
  const result = await createPresignedUploadUrl(key, body.contentType);
  return NextResponse.json(result);
});

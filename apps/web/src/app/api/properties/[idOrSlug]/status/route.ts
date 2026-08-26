import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { canManageProperty } from "@/lib/properties/getProperty";
import { findLikelyDuplicate, flagPossibleDuplicate } from "@/lib/properties/duplicateDetection";

// Statuses an owner/agent/company can set directly. PENDING_REVIEW and
// REJECTED are only ever set by the verification workflow (admin routes).
const ownerSettableStatus = z.enum(["DRAFT", "PUBLISHED", "SOLD", "RENTED", "ARCHIVED"]);

export const PATCH = withErrorHandling(async (req, { params }: { params: { idOrSlug: string } }) => {
  const user = await requireUser();
  const { status } = z.object({ status: ownerSettableStatus }).parse(await req.json());

  const property = await prisma.property.findFirst({
    where: { OR: [{ id: params.idOrSlug }, { slug: params.idOrSlug }] },
  });
  if (!property) return jsonError("Property not found", 404);

  if (!canManageProperty(property, user)) return jsonError("You cannot change this property's status", 403);

  const updated = await prisma.property.update({
    where: { id: property.id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" && !property.publishedAt ? new Date() : property.publishedAt,
    },
    select: { id: true, status: true, publishedAt: true },
  });

  let possibleDuplicateOf: string | null = null;
  if (status === "PUBLISHED") {
    const duplicate = await findLikelyDuplicate({
      id: property.id,
      ownerId: property.ownerId,
      title: property.title,
      address: property.address,
      lat: property.lat,
      lng: property.lng,
    });
    if (duplicate) {
      await flagPossibleDuplicate(property.id, duplicate.id);
      possibleDuplicateOf = duplicate.id;
    }
  }

  return NextResponse.json({ ...updated, possibleDuplicateOf });
});

import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { getSimilarProperties } from "@/lib/properties/getProperty";

export const GET = withErrorHandling(async (_req, { params }: { params: { idOrSlug: string } }) => {
  const property = await prisma.property.findFirst({
    where: { OR: [{ id: params.idOrSlug }, { slug: params.idOrSlug }] },
    select: { id: true, category: true, type: true, cityId: true, listingType: true },
  });
  if (!property) return jsonError("Property not found", 404);

  const similar = await getSimilarProperties(property);
  return NextResponse.json(similar);
});

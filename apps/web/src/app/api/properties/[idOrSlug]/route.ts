import { NextResponse } from "next/server";
import { prisma, Prisma } from "@nyumba/db";
import { propertyUpdateSchema } from "@nyumba/shared";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { PROPERTY_DETAIL_SELECT } from "@/lib/properties/select";
import { findPropertyByIdOrSlug, recordPropertyView, canManageProperty } from "@/lib/properties/getProperty";

export const GET = withErrorHandling(async (req, { params }: { params: { idOrSlug: string } }) => {
  const property = await findPropertyByIdOrSlug(params.idOrSlug);
  if (!property) return jsonError("Property not found", 404);

  const user = await getCurrentUser();
  if (property.status !== "PUBLISHED" && !canManageProperty(property, user)) {
    return jsonError("Property not found", 404);
  }

  if (property.status === "PUBLISHED") {
    const url = new URL(req.url);
    await recordPropertyView(property.id, user?.id, url.searchParams.get("source") ?? "detail");
  }

  return NextResponse.json(property);
});

export const PATCH = withErrorHandling(async (req, { params }: { params: { idOrSlug: string } }) => {
  const user = await requireUser();
  const property = await prisma.property.findFirst({ where: { OR: [{ id: params.idOrSlug }, { slug: params.idOrSlug }] } });
  if (!property) return jsonError("Property not found", 404);
  if (!canManageProperty(property, user)) return jsonError("You cannot edit this property", 403);

  const body = propertyUpdateSchema.parse(await req.json());
  const updated = await prisma.property.update({
    where: { id: property.id },
    // Body carries flat FK scalars (countryId/cityId) rather than nested
    // relation-connect syntax, so this is always the "unchecked" update shape.
    data: body as Prisma.PropertyUncheckedUpdateInput,
    select: PROPERTY_DETAIL_SELECT,
  });
  return NextResponse.json(updated);
});

export const DELETE = withErrorHandling(async (_req, { params }: { params: { idOrSlug: string } }) => {
  const user = await requireUser();
  const property = await prisma.property.findFirst({ where: { OR: [{ id: params.idOrSlug }, { slug: params.idOrSlug }] } });
  if (!property) return jsonError("Property not found", 404);
  if (!canManageProperty(property, user)) return jsonError("You cannot delete this property", 403);

  await prisma.property.delete({ where: { id: property.id } });
  return NextResponse.json({ ok: true });
});

import { prisma } from "@nyumba/db";
import { PROPERTY_DETAIL_SELECT, PROPERTY_CARD_SELECT } from "./select";

export function findPropertyByIdOrSlug(idOrSlug: string) {
  return prisma.property.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: PROPERTY_DETAIL_SELECT,
  });
}

export async function recordPropertyView(propertyId: string, userId?: string, source = "detail") {
  await Promise.all([
    prisma.property.update({ where: { id: propertyId }, data: { viewCount: { increment: 1 } } }),
    prisma.propertyView.create({ data: { propertyId, userId, source } }),
  ]);
}

export async function getSimilarProperties(property: {
  id: string;
  category: string;
  type: string;
  cityId: string;
  listingType: string;
}) {
  return prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: property.id },
      OR: [
        { cityId: property.cityId, category: property.category as any },
        { type: property.type as any, listingType: property.listingType as any },
      ],
    },
    orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
    take: 6,
    select: PROPERTY_CARD_SELECT,
  });
}

export function canManageProperty(
  property: { ownerId: string; companyId: string | null },
  user: { id: string; role: string; companyId: string | null } | null
) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.id === property.ownerId) return true;
  if (property.companyId && user.companyId === property.companyId) return true;
  return false;
}

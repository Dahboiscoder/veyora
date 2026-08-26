import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (_req, { params }: { params: { idOrSlug: string } }) => {
  const user = await requireUser();
  const property = await prisma.property.findFirst({
    where: { OR: [{ id: params.idOrSlug }, { slug: params.idOrSlug }] },
    select: { id: true, ownerId: true },
  });
  if (!property) return jsonError("Property not found", 404);

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId: property.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.favorite.delete({ where: { id: existing.id } }),
      prisma.property.update({ where: { id: property.id }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ favorited: false });
  }

  await prisma.$transaction([
    prisma.favorite.create({ data: { userId: user.id, propertyId: property.id } }),
    prisma.property.update({ where: { id: property.id }, data: { likeCount: { increment: 1 } } }),
  ]);

  await prisma.notification.create({
    data: {
      userId: property.ownerId,
      type: "FAVORITE",
      title: "Someone favorited your property",
      body: `${user.name} saved one of your listings.`,
      data: { propertyId: property.id },
    },
  }).catch(() => undefined);

  return NextResponse.json({ favorited: true });
});

import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { canManageProperty } from "@/lib/properties/getProperty";

async function loadManagedProperty(idOrSlug: string, user: Parameters<typeof canManageProperty>[1]) {
  const property = await prisma.property.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } });
  if (!property) return null;
  return canManageProperty(property, user) ? property : null;
}

export const PATCH = withErrorHandling(
  async (req, { params }: { params: { idOrSlug: string; mediaId: string } }) => {
    const user = await requireUser();
    const property = await loadManagedProperty(params.idOrSlug, user);
    if (!property) return jsonError("Property not found or not editable by you", 404);

    const { isPrimary } = (await req.json()) as { isPrimary?: boolean };
    if (isPrimary) {
      await prisma.propertyMedia.updateMany({ where: { propertyId: property.id }, data: { isPrimary: false } });
    }

    const updated = await prisma.propertyMedia.update({
      where: { id: params.mediaId },
      data: { isPrimary: !!isPrimary },
    });

    return NextResponse.json(updated);
  }
);

export const DELETE = withErrorHandling(
  async (_req, { params }: { params: { idOrSlug: string; mediaId: string } }) => {
    const user = await requireUser();
    const property = await loadManagedProperty(params.idOrSlug, user);
    if (!property) return jsonError("Property not found or not editable by you", 404);

    await prisma.propertyMedia.deleteMany({ where: { id: params.mediaId, propertyId: property.id } });
    return NextResponse.json({ ok: true });
  }
);

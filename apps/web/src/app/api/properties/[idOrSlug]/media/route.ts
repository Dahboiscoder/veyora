import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { propertyMediaCreateSchema } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { canManageProperty } from "@/lib/properties/getProperty";

async function assertManager(idOrSlug: string, user: { id: string; role: string; companyId: string | null }) {
  const property = await prisma.property.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } });
  if (!property) return null;
  return canManageProperty(property, user) ? property : null;
}

export const POST = withErrorHandling(async (req, { params }: { params: { idOrSlug: string } }) => {
  const user = await requireUser();
  const property = await assertManager(params.idOrSlug, user);
  if (!property) return jsonError("Property not found or not editable by you", 404);

  const body = propertyMediaCreateSchema.parse(await req.json());

  if (body.isPrimary) {
    await prisma.propertyMedia.updateMany({ where: { propertyId: property.id }, data: { isPrimary: false } });
  }

  const media = await prisma.propertyMedia.create({
    data: { ...body, propertyId: property.id },
  });

  return NextResponse.json(media, { status: 201 });
});

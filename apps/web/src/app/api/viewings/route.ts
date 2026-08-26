import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { viewingRequestSchema } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = viewingRequestSchema.parse(await req.json());

  const property = await prisma.property.findUnique({ where: { id: body.propertyId }, select: { ownerId: true, title: true } });
  if (!property) return jsonError("Property not found", 404);

  const viewing = await prisma.viewing.create({
    data: {
      propertyId: body.propertyId,
      requesterId: user.id,
      hostId: property.ownerId,
      proposedAt: body.proposedAt,
      message: body.message,
    },
  });

  await prisma.notification.create({
    data: {
      userId: property.ownerId,
      type: "VIEWING_SCHEDULED",
      title: `${user.name} requested a viewing`,
      body: `${property.title} · ${new Date(body.proposedAt).toLocaleString()}`,
      data: { propertyId: body.propertyId, viewingId: viewing.id },
    },
  });

  return NextResponse.json(viewing, { status: 201 });
});

export const GET = withErrorHandling(async (req) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const as = url.searchParams.get("as") === "host" ? "host" : "requester";

  const viewings = await prisma.viewing.findMany({
    where: as === "host" ? { hostId: user.id } : { requesterId: user.id },
    orderBy: { proposedAt: "asc" },
    include: {
      property: { select: { id: true, slug: true, title: true, city: { select: { name: true } } } },
      requester: { select: { id: true, name: true, avatarUrl: true } },
      host: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(viewings);
});

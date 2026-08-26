import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@nyumba/db";
import { liveStreamCreateSchema, CAN_LIST_ROLES } from "@nyumba/shared";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { canManageProperty } from "@/lib/properties/getProperty";

const LIVE_STREAM_CARD_SELECT = {
  id: true,
  title: true,
  status: true,
  scheduledFor: true,
  startedAt: true,
  currentViewers: true,
  peakViewers: true,
  host: { select: { id: true, name: true, avatarUrl: true, role: true } },
  property: {
    select: {
      id: true,
      slug: true,
      title: true,
      city: { select: { name: true } },
      country: { select: { name: true, flagEmoji: true } },
      media: { where: { type: "IMAGE" as const }, orderBy: { order: "asc" as const }, take: 1, select: { url: true } },
    },
  },
} as const;

export const GET = withErrorHandling(async (req) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const mine = url.searchParams.get("mine") === "true";

  let hostId: string | undefined;
  if (mine) {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required", 401);
    hostId = user.id;
  }

  const streams = await prisma.liveStream.findMany({
    where: {
      ...(hostId ? { hostId } : {}),
      ...(status ? { status: status as any } : mine ? {} : { status: { in: ["LIVE", "SCHEDULED"] } }),
    },
    orderBy: [{ status: "asc" }, { currentViewers: "desc" }, { scheduledFor: "asc" }],
    select: LIVE_STREAM_CARD_SELECT,
  });

  return NextResponse.json(streams);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser(CAN_LIST_ROLES);
  const body = liveStreamCreateSchema.parse(await req.json());

  const property = await prisma.property.findUnique({ where: { id: body.propertyId } });
  if (!property) return jsonError("Property not found", 404);
  if (!canManageProperty(property, user)) return jsonError("You cannot start a live tour for this property", 403);

  const stream = await prisma.liveStream.create({
    data: {
      propertyId: body.propertyId,
      hostId: user.id,
      title: body.title,
      status: body.scheduledFor ? "SCHEDULED" : "LIVE",
      scheduledFor: body.scheduledFor,
      startedAt: body.scheduledFor ? undefined : new Date(),
      streamKey: nanoid(24),
    },
    select: LIVE_STREAM_CARD_SELECT,
  });

  return NextResponse.json(stream, { status: 201 });
});

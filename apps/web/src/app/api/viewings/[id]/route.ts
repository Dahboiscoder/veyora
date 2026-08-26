import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

const updateSchema = z.object({ status: z.enum(["CONFIRMED", "DECLINED", "COMPLETED", "CANCELED"]) });

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const { status } = updateSchema.parse(await req.json());

  const viewing = await prisma.viewing.findUnique({ where: { id: params.id } });
  if (!viewing) return jsonError("Viewing not found", 404);
  if (viewing.hostId !== user.id && viewing.requesterId !== user.id && user.role !== "ADMIN") {
    return jsonError("You are not part of this viewing", 403);
  }

  const updated = await prisma.viewing.update({ where: { id: params.id }, data: { status } });

  await prisma.notification.create({
    data: {
      userId: user.id === viewing.hostId ? viewing.requesterId : viewing.hostId,
      type: "VIEWING_SCHEDULED",
      title: `Viewing ${status.toLowerCase()}`,
      data: { viewingId: viewing.id, propertyId: viewing.propertyId },
    },
  });

  return NextResponse.json(updated);
});

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

const updateSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SOLD", "RENTED", "ARCHIVED", "REJECTED"]).optional(),
  verificationStatus: z.enum(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"]).optional(),
  isFeatured: z.boolean().optional(),
});

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  await requireUser(["ADMIN"]);
  const body = updateSchema.parse(await req.json());

  const property = await prisma.property.update({
    where: { id: params.id },
    data: {
      ...body,
      publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  if (body.status || body.verificationStatus) {
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: body.verificationStatus ? "VERIFICATION_UPDATE" : "SYSTEM",
        title: body.verificationStatus
          ? `"${property.title}" verification is now ${body.verificationStatus.toLowerCase()}`
          : `"${property.title}" status changed to ${body.status?.toLowerCase()}`,
        data: { propertyId: property.id },
      },
    });
  }

  return NextResponse.json(property);
});

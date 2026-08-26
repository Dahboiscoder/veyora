import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

const updateSchema = z.object({
  verificationStatus: z.enum(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"]).optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["USER", "OWNER", "AGENT", "COMPANY", "ADMIN"]).optional(),
});

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  const admin = await requireUser(["ADMIN"]);
  const body = updateSchema.parse(await req.json());

  if (params.id === admin.id && (body.role || body.isActive === false)) {
    return jsonError("You cannot change your own role or deactivate yourself", 422);
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: body,
    select: { id: true, name: true, email: true, role: true, verificationStatus: true, isActive: true },
  });

  if (body.verificationStatus) {
    await prisma.notification.create({
      data: {
        userId: params.id,
        type: "VERIFICATION_UPDATE",
        title: `Your account verification is now ${body.verificationStatus.toLowerCase()}`,
      },
    });
  }

  return NextResponse.json(updated);
});

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
});

export const PATCH = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = updateSchema.parse(await req.json());

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: body,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      bio: true,
      avatarUrl: true,
      role: true,
      companyId: true,
      verificationStatus: true,
      countryId: true,
    },
  });

  return NextResponse.json(updated);
});

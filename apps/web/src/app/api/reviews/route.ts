import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { reviewCreateSchema } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = reviewCreateSchema.parse(await req.json());

  if (!body.propertyId && !body.agentId && !body.companyId) {
    return jsonError("A review must target a property, agent, or company", 422);
  }

  const review = await prisma.review.create({
    data: { ...body, authorId: user.id },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json(review, { status: 201 });
});

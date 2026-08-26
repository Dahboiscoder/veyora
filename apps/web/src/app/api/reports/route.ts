import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { reportCreateSchema } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = reportCreateSchema.parse(await req.json());

  if (!body.propertyId && !body.targetUserId) {
    return jsonError("A report must target a property or a user", 422);
  }

  const report = await prisma.report.create({
    data: { ...body, reporterId: user.id },
  });

  return NextResponse.json(report, { status: 201 });
});

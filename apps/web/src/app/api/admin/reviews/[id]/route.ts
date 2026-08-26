import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const DELETE = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  await requireUser(["ADMIN"]);
  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});

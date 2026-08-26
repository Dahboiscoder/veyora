import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();

  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) return jsonError("Company not found", 404);

  const existing = await prisma.companyFollow.findUnique({
    where: { followerId_companyId: { followerId: user.id, companyId: params.id } },
  });

  if (existing) {
    await prisma.companyFollow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.companyFollow.create({ data: { followerId: user.id, companyId: params.id } });
  return NextResponse.json({ following: true });
});

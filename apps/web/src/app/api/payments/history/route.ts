import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const [payments, subscription] = await Promise.all([
    prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.subscription.findFirst({ where: user.companyId ? { companyId: user.companyId } : { userId: user.id } }),
  ]);

  return NextResponse.json({ payments, subscription });
});

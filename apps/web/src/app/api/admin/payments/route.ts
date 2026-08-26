import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async (req) => {
  await requireUser(["ADMIN"]);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const payments = await prisma.payment.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      amount: true,
      currencyCode: true,
      purpose: true,
      status: true,
      provider: true,
      providerRef: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(payments);
});

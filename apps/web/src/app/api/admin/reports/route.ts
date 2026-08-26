import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async (req) => {
  await requireUser(["ADMIN"]);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const reports = await prisma.report.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      createdAt: true,
      reporter: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, slug: true, title: true } },
      targetUser: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(reports);
});

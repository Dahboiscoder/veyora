import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  await requireUser(["ADMIN"]);

  const [
    totalUsers,
    usersByRole,
    totalProperties,
    propertiesByStatus,
    pendingVerification,
    totalCompanies,
    pendingReports,
    liveNow,
    totalMessages,
    recentUsers,
    recentReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.property.count(),
    prisma.property.groupBy({ by: ["status"], _count: true }),
    prisma.property.count({ where: { verificationStatus: "PENDING" } }),
    prisma.company.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.liveStream.count({ where: { status: "LIVE" } }),
    prisma.message.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, reason: true, createdAt: true, property: { select: { title: true, slug: true } } },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])),
    totalProperties,
    propertiesByStatus: Object.fromEntries(propertiesByStatus.map((r) => [r.status, r._count])),
    pendingVerification,
    totalCompanies,
    pendingReports,
    liveNow,
    totalMessages,
    recentUsers,
    recentReports,
  });
});

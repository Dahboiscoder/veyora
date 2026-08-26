import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { CAN_LIST_ROLES } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

function last14DaysBuckets(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
}

export const GET = withErrorHandling(async () => {
  const user = await requireUser(CAN_LIST_ROLES);
  const scope = user.companyId ? { companyId: user.companyId } : { ownerId: user.id };

  const [total, published, draft, sold, aggregates, viewingsPending, activeLive, favoritesTotal, recentViews] = await Promise.all([
    prisma.property.count({ where: scope }),
    prisma.property.count({ where: { ...scope, status: "PUBLISHED" } }),
    prisma.property.count({ where: { ...scope, status: "DRAFT" } }),
    prisma.property.count({ where: { ...scope, status: { in: ["SOLD", "RENTED"] } } }),
    prisma.property.aggregate({ where: scope, _sum: { viewCount: true, likeCount: true } }),
    prisma.viewing.count({ where: { hostId: user.id, status: "REQUESTED" } }),
    prisma.liveStream.count({ where: { hostId: user.id, status: "LIVE" } }),
    prisma.favorite.count({ where: { property: scope } }),
    prisma.propertyView.findMany({
      where: { property: scope, createdAt: { gt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
    }),
  ]);

  const counts = new Map(last14DaysBuckets().map((day) => [day, 0]));
  for (const view of recentViews) {
    const day = view.createdAt.toISOString().slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return NextResponse.json({
    total,
    published,
    draft,
    sold,
    totalViews: aggregates._sum.viewCount ?? 0,
    totalLikes: aggregates._sum.likeCount ?? 0,
    totalFavorites: favoritesTotal,
    pendingViewings: viewingsPending,
    activeLiveStreams: activeLive,
    viewsByDay: Array.from(counts.entries()).map(([day, count]) => ({ day, count })),
  });
});

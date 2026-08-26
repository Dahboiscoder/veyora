import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async (req) => {
  await requireUser(["ADMIN"]);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const streams = await prisma.liveStream.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      status: true,
      scheduledFor: true,
      startedAt: true,
      endedAt: true,
      currentViewers: true,
      peakViewers: true,
      createdAt: true,
      host: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, slug: true, title: true } },
    },
  });

  return NextResponse.json(streams);
});

import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  await requireUser(["ADMIN"]);

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      author: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, slug: true, title: true } },
      agent: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(reviews);
});

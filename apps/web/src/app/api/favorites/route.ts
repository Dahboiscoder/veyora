import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { property: { select: PROPERTY_CARD_SELECT } },
  });

  return NextResponse.json(favorites.map((f) => f.property));
});

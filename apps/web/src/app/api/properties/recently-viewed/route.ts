import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const views = await prisma.propertyView.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    distinct: ["propertyId"],
    take: 24,
    select: { property: { select: PROPERTY_CARD_SELECT } },
  });

  return NextResponse.json(views.map((v) => v.property));
});

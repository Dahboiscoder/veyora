import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { CAN_LIST_ROLES } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";

export const GET = withErrorHandling(async (req) => {
  const user = await requireUser(CAN_LIST_ROLES);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const scope = user.companyId ? { companyId: user.companyId } : { ownerId: user.id };

  const properties = await prisma.property.findMany({
    where: { ...scope, ...(status ? { status: status as any } : {}) },
    orderBy: { updatedAt: "desc" },
    select: PROPERTY_CARD_SELECT,
  });

  return NextResponse.json(properties);
});

import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";

export const GET = withErrorHandling(async (req) => {
  await requireUser(["ADMIN"]);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const verification = url.searchParams.get("verification");

  const properties = await prisma.property.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(verification ? { verificationStatus: verification as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: PROPERTY_CARD_SELECT,
  });

  return NextResponse.json(properties);
});

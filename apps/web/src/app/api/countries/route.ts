import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      flagEmoji: true,
      currencyCode: true,
      currencySymbol: true,
      cities: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, lat: true, lng: true },
      },
    },
  });
  return NextResponse.json(countries);
});

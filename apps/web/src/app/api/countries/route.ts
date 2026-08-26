import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { withErrorHandling } from "@/lib/api/response";

// Force dynamic — this route takes no request-dependent params, so Next.js
// would otherwise statically optimize it at build time and cache whatever
// the DB returned then (which was an empty result before seeding ran, and
// would never self-correct without a redeploy).
export const dynamic = "force-dynamic";

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

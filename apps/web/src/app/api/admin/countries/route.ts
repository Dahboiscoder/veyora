import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  await requireUser(["ADMIN"]);

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    include: {
      cities: { orderBy: { name: "asc" } },
      _count: { select: { properties: true } },
    },
  });

  return NextResponse.json(countries);
});

const createSchema = z.object({
  code: z.string().trim().toUpperCase().length(2),
  name: z.string().trim().min(2),
  currencyCode: z.string().trim().toUpperCase().length(3),
  currencySymbol: z.string().trim().min(1),
  phoneCode: z.string().trim().min(2),
  flagEmoji: z.string().trim().optional(),
});

export const POST = withErrorHandling(async (req) => {
  await requireUser(["ADMIN"]);
  const body = createSchema.parse(await req.json());

  const existing = await prisma.country.findUnique({ where: { code: body.code } });
  if (existing) return jsonError("A country with this code already exists", 409);

  const country = await prisma.country.create({ data: body, include: { cities: true } });
  return NextResponse.json(country, { status: 201 });
});

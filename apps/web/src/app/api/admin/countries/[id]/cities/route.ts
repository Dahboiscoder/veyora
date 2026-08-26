import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

const createSchema = z.object({
  name: z.string().trim().min(2),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const POST = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  await requireUser(["ADMIN"]);
  const body = createSchema.parse(await req.json());

  const country = await prisma.country.findUnique({ where: { id: params.id } });
  if (!country) return jsonError("Country not found", 404);

  const existing = await prisma.city.findUnique({
    where: { countryId_name: { countryId: params.id, name: body.name } },
  });
  if (existing) return jsonError("A city with this name already exists in this country", 409);

  const city = await prisma.city.create({ data: { ...body, countryId: params.id } });
  return NextResponse.json(city, { status: 201 });
});

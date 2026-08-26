import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

const updateSchema = z.object({ isActive: z.boolean() });

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  await requireUser(["ADMIN"]);
  const { isActive } = updateSchema.parse(await req.json());

  const city = await prisma.city.update({ where: { id: params.id }, data: { isActive } });
  return NextResponse.json(city);
});

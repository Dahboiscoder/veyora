import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { savedSearchCreateSchema } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const searches = await prisma.savedSearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(searches);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = savedSearchCreateSchema.parse(await req.json());
  const search = await prisma.savedSearch.create({ data: { ...body, userId: user.id } });
  return NextResponse.json(search, { status: 201 });
});

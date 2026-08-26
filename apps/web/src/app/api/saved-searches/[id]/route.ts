import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const DELETE = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const search = await prisma.savedSearch.findUnique({ where: { id: params.id } });
  if (!search || search.userId !== user.id) return jsonError("Saved search not found", 404);

  await prisma.savedSearch.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});

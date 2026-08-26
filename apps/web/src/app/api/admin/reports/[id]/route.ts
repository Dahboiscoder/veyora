import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

const updateSchema = z.object({ status: z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]) });

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  await requireUser(["ADMIN"]);
  const { status } = updateSchema.parse(await req.json());

  const report = await prisma.report.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(report);
});

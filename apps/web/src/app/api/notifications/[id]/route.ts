import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const PATCH = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const notification = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notification || notification.userId !== user.id) return jsonError("Notification not found", 404);

  const updated = await prisma.notification.update({ where: { id: params.id }, data: { isRead: true } });
  return NextResponse.json(updated);
});

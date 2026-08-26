import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const { currentPassword, newPassword } = schema.parse(await req.json());

  const fullUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const valid = await verifyPassword(currentPassword, fullUser.passwordHash);
  if (!valid) return jsonError("Current password is incorrect", 401);

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, refreshTokenHash: null } });

  return NextResponse.json({ ok: true });
});

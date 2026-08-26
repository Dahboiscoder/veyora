import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { loginSchema } from "@nyumba/shared";
import { verifyPassword, hashToken } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (req) => {
  const body = loginSchema.parse(await req.json());

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return jsonError("Invalid email or password", 401);

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) return jsonError("Invalid email or password", 401);
  if (!user.isActive) return jsonError("This account has been deactivated", 403);

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hashToken(refreshToken), lastSeenAt: new Date() },
  });

  const res = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
});

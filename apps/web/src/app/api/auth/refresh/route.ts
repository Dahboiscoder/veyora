import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@nyumba/db";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/password";
import { COOKIE_NAMES, setAuthCookies, clearAuthCookies } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async () => {
  const token = cookies().get(COOKIE_NAMES.refresh)?.value;
  if (!token) return jsonError("No refresh token", 401);

  const decoded = verifyRefreshToken(token);
  if (!decoded) return jsonError("Invalid or expired session", 401);

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive || user.refreshTokenHash !== hashToken(token)) {
    const res = jsonError("Session no longer valid", 401);
    clearAuthCookies(res);
    return res;
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hashToken(refreshToken) },
  });

  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
});

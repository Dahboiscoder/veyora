import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@nyumba/db";
import { COOKIE_NAMES, clearAuthCookies } from "@/lib/auth/session";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { withErrorHandling } from "@/lib/api/response";

export const POST = withErrorHandling(async () => {
  const refreshToken = cookies().get(COOKIE_NAMES.refresh)?.value;
  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded) {
      await prisma.user
        .update({ where: { id: decoded.sub }, data: { refreshTokenHash: null } })
        .catch(() => undefined);
    }
  }
  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
});

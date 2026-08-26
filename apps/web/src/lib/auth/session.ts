import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { env } from "@/lib/env";
import { verifyAccessToken } from "@/lib/auth/jwt";

export const COOKIE_NAMES = {
  access: "nyumba_at",
  refresh: "nyumba_rt",
} as const;

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set(COOKIE_NAMES.access, accessToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  res.cookies.set(COOKIE_NAMES.refresh, refreshToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: env.jwtRefreshTtlMs / 1000,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(COOKIE_NAMES.access, "", { path: "/", maxAge: 0 });
  res.cookies.set(COOKIE_NAMES.refresh, "", { path: "/", maxAge: 0 });
}

export type CurrentUser = Awaited<ReturnType<typeof fetchUserById>>;

async function fetchUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      companyId: true,
      verificationStatus: true,
      isActive: true,
      countryId: true,
    },
  });
}

/** Reads the access-token cookie and resolves the current user, or null. Safe to call from Server Components, layouts, and Route Handlers. */
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAMES.access)?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload) return null;
  const user = await fetchUserById(payload.sub);
  if (!user || !user.isActive) return null;
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** For use inside Route Handlers that require auth (and optionally a role allowlist). Throws AuthError, which route handlers should catch and map to a JSON response. */
export async function requireUser(allowedRoles?: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required", 401);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("You do not have permission to perform this action", 403);
  }
  return user;
}

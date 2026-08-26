import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { registerSchema } from "@nyumba/shared";
import { hashPassword, hashToken } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { slugify } from "@/lib/utils";

export const POST = withErrorHandling(async (req) => {
  const body = registerSchema.parse(await req.json());

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return jsonError("An account with this email already exists", 409);

  if (body.role === "COMPANY" && !body.companyName) {
    return jsonError("companyName is required when registering as a company", 422);
  }

  const passwordHash = await hashPassword(body.password);
  const country = body.countryCode
    ? await prisma.country.findUnique({ where: { code: body.countryCode } })
    : null;

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      passwordHash,
      role: body.role,
      countryId: country?.id,
    },
  });

  if (body.role === "COMPANY" && body.companyName) {
    let slug = slugify(body.companyName);
    const clash = await prisma.company.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${user.id.slice(-6)}`;
    await prisma.company.create({
      data: { ownerId: user.id, name: body.companyName, slug },
    });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hashToken(refreshToken) },
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

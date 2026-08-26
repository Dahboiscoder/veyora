import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";

export const GET = withErrorHandling(async (req) => {
  await requireUser(["ADMIN"]);
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const q = url.searchParams.get("q");

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as any } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verificationStatus: true,
      isActive: true,
      createdAt: true,
      company: { select: { id: true, name: true } },
      _count: { select: { properties: true } },
    },
  });

  return NextResponse.json(users);
});

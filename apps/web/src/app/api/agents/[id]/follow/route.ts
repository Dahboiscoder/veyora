import { NextResponse } from "next/server";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const POST = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  if (params.id === user.id) return jsonError("You cannot follow yourself", 422);

  const agent = await prisma.user.findUnique({ where: { id: params.id } });
  if (!agent) return jsonError("Agent not found", 404);

  const existing = await prisma.agentFollow.findUnique({
    where: { followerId_agentId: { followerId: user.id, agentId: params.id } },
  });

  if (existing) {
    await prisma.agentFollow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.agentFollow.create({ data: { followerId: user.id, agentId: params.id } });
  await prisma.notification.create({
    data: {
      userId: params.id,
      type: "SYSTEM",
      title: "New follower",
      body: `${user.name} started following you.`,
    },
  });
  return NextResponse.json({ following: true });
});

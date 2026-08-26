import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

async function assertParticipant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

export const GET = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const participant = await assertParticipant(params.id, user.id);
  if (!participant) return jsonError("Conversation not found", 404);

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json(messages.reverse());
});

const sendSchema = z.object({
  text: z.string().min(1).max(4000).optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.string().optional(),
});

export const POST = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const participant = await assertParticipant(params.id, user.id);
  if (!participant) return jsonError("Conversation not found", 404);

  const body = sendSchema.parse(await req.json());
  if (!body.text && !body.attachmentUrl) return jsonError("Message must have text or an attachment", 422);

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: user.id, ...body },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });
  await prisma.conversation.update({ where: { id: params.id }, data: { lastMessageAt: new Date() } });

  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId: params.id, userId: { not: user.id } },
    select: { userId: true },
  });
  await prisma.notification.createMany({
    data: others.map((o) => ({
      userId: o.userId,
      type: "MESSAGE" as const,
      title: `New message from ${user.name}`,
      body: body.text ?? "Sent an attachment",
      data: { conversationId: params.id },
    })),
  });

  return NextResponse.json(message, { status: 201 });
});

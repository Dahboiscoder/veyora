import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true,
      lastMessageAt: true,
      property: { select: { id: true, slug: true, title: true, media: { where: { type: "IMAGE" }, take: 1, orderBy: { order: "asc" } } } },
      participants: {
        select: {
          userId: true,
          lastReadAt: true,
          user: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { text: true, attachmentUrl: true, senderId: true, createdAt: true } },
    },
  });

  const withUnread = await Promise.all(
    conversations.map(async (c) => {
      const me = c.participants.find((p) => p.userId === user.id);
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: user.id },
          createdAt: { gt: me?.lastReadAt ?? new Date(0) },
        },
      });
      return {
        ...c,
        otherParticipants: c.participants.filter((p) => p.userId !== user.id).map((p) => p.user),
        lastMessage: c.messages[0] ?? null,
        unreadCount,
      };
    })
  );

  return NextResponse.json(withUnread);
});

const createSchema = z.object({
  recipientId: z.string(),
  propertyId: z.string().optional(),
  text: z.string().min(1).max(4000).optional(),
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const body = createSchema.parse(await req.json());

  if (body.recipientId === user.id) return jsonError("You cannot message yourself", 422);

  const recipient = await prisma.user.findUnique({ where: { id: body.recipientId } });
  if (!recipient) return jsonError("Recipient not found", 404);

  let conversation = await prisma.conversation.findFirst({
    where: {
      propertyId: body.propertyId ?? null,
      AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId: body.recipientId } } }],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        propertyId: body.propertyId,
        participants: { create: [{ userId: user.id }, { userId: body.recipientId }] },
      },
    });
  }

  if (body.text) {
    await prisma.message.create({
      data: { conversationId: conversation.id, senderId: user.id, text: body.text },
    });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });
    await prisma.notification.create({
      data: {
        userId: body.recipientId,
        type: "MESSAGE",
        title: `New message from ${user.name}`,
        body: body.text,
        data: { conversationId: conversation.id },
      },
    });
  }

  return NextResponse.json({ id: conversation.id }, { status: 201 });
});

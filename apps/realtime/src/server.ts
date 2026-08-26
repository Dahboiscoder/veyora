import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server, type Socket } from "socket.io";
import { prisma } from "@nyumba/db";
import { env, assertSafeToRunInProduction } from "./env";
import { authenticateSocket, type AuthedUser } from "./auth";
import { userRoom, conversationRoom, liveRoom } from "./rooms";

assertSafeToRunInProduction();

const app = express();
app.use(cors({ origin: env.webOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "nyumba-realtime" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.webOrigin, credentials: true },
});

// live streamId -> set of socket ids currently watching
const liveViewers = new Map<string, Set<string>>();

// userId -> number of open sockets (multiple tabs/devices) currently
// connected, so presence only flips offline once every connection drops.
const onlineUsers = new Map<string, number>();

function currentViewerCount(streamId: string) {
  return liveViewers.get(streamId)?.size ?? 0;
}

async function broadcastViewerCount(streamId: string) {
  const count = currentViewerCount(streamId);
  io.to(liveRoom(streamId)).emit("live:viewers", { streamId, count });

  const row = await prisma.liveStream.findUnique({ where: { id: streamId }, select: { peakViewers: true } });
  if (!row) return;
  await prisma.liveStream
    .update({
      where: { id: streamId },
      data: { currentViewers: count, peakViewers: Math.max(row.peakViewers, count) },
    })
    .catch(() => undefined);
}

io.use((socket, next) => {
  const user = authenticateSocket(socket);
  if (!user) {
    // Allow anonymous connections (e.g. watching a live tour while logged
    // out) — they simply can't send chat/messages, enforced per-event below.
    socket.data.user = null;
    return next();
  }
  socket.data.user = user;
  next();
});

io.on("connection", (socket: Socket) => {
  const user = socket.data.user as AuthedUser | null;
  const joinedLive = new Set<string>();

  if (user) {
    socket.join(userRoom(user.id));
    prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
    const priorConnections = onlineUsers.get(user.id) ?? 0;
    onlineUsers.set(user.id, priorConnections + 1);
    if (priorConnections === 0) io.emit("presence:online", { userId: user.id });
  }

  socket.on("presence:list", (_payload: unknown, callback: (userIds: string[]) => void) => {
    callback?.(Array.from(onlineUsers.keys()));
  });

  socket.on("conversation:join", async ({ conversationId }: { conversationId: string }) => {
    if (!user) return;
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    });
    if (!participant) return;
    socket.join(conversationRoom(conversationId));
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: user.id } },
      data: { lastReadAt: new Date() },
    });
  });

  socket.on("conversation:leave", ({ conversationId }: { conversationId: string }) => {
    socket.leave(conversationRoom(conversationId));
  });

  socket.on(
    "message:send",
    async (payload: { conversationId: string; text?: string; attachmentUrl?: string; attachmentType?: string }) => {
      if (!user) return socket.emit("error:auth", { message: "You must be logged in to send messages" });
      const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: payload.conversationId, userId: user.id } },
      });
      if (!participant) return;
      if (!payload.text?.trim() && !payload.attachmentUrl) return;

      const message = await prisma.message.create({
        data: {
          conversationId: payload.conversationId,
          senderId: user.id,
          text: payload.text?.trim(),
          attachmentUrl: payload.attachmentUrl,
          attachmentType: payload.attachmentType,
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      });
      await prisma.conversation.update({
        where: { id: payload.conversationId },
        data: { lastMessageAt: new Date() },
      });

      io.to(conversationRoom(payload.conversationId)).emit("message:new", message);

      const otherParticipants = await prisma.conversationParticipant.findMany({
        where: { conversationId: payload.conversationId, userId: { not: user.id } },
        select: { userId: true },
      });
      for (const p of otherParticipants) {
        io.to(userRoom(p.userId)).emit("message:notify", { conversationId: payload.conversationId, message });
        await prisma.notification
          .create({
            data: {
              userId: p.userId,
              type: "MESSAGE",
              title: `New message from ${message.sender.name}`,
              body: message.text ?? "Sent an attachment",
              data: { conversationId: payload.conversationId },
            },
          })
          .catch(() => undefined);
      }
    }
  );

  socket.on("live:join", async ({ streamId }: { streamId: string }) => {
    socket.join(liveRoom(streamId));
    if (!liveViewers.has(streamId)) liveViewers.set(streamId, new Set());
    liveViewers.get(streamId)!.add(socket.id);
    joinedLive.add(streamId);
    await broadcastViewerCount(streamId);
  });

  socket.on("live:leave", async ({ streamId }: { streamId: string }) => {
    socket.leave(liveRoom(streamId));
    liveViewers.get(streamId)?.delete(socket.id);
    joinedLive.delete(streamId);
    await broadcastViewerCount(streamId);
  });

  socket.on("live:chat", async ({ streamId, text }: { streamId: string; text: string }) => {
    if (!user) return socket.emit("error:auth", { message: "You must be logged in to chat" });
    if (!text?.trim()) return;
    const message = await prisma.liveChatMessage.create({
      data: { liveStreamId: streamId, userId: user.id, text: text.trim().slice(0, 500) },
      include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    });
    io.to(liveRoom(streamId)).emit("live:chat:new", message);
  });

  socket.on("disconnect", async () => {
    for (const streamId of joinedLive) {
      liveViewers.get(streamId)?.delete(socket.id);
      await broadcastViewerCount(streamId);
    }

    if (user) {
      const remaining = (onlineUsers.get(user.id) ?? 1) - 1;
      if (remaining <= 0) {
        onlineUsers.delete(user.id);
        const lastSeenAt = new Date();
        await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt } }).catch(() => undefined);
        io.emit("presence:offline", { userId: user.id, lastSeenAt: lastSeenAt.toISOString() });
      } else {
        onlineUsers.set(user.id, remaining);
      }
    }
  });
});

// --- Internal HTTP endpoints, called by the Next.js API for server-to-server events ---
function requireInternalSecret(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.headers["x-internal-secret"] !== env.internalSecret) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

app.post("/internal/notify", requireInternalSecret, (req, res) => {
  const { userId, notification } = req.body ?? {};
  if (!userId || !notification) return res.status(422).json({ error: "userId and notification are required" });
  io.to(userRoom(userId)).emit("notification:new", notification);
  res.json({ ok: true });
});

app.post("/internal/live/:streamId/status", requireInternalSecret, (req, res) => {
  const { status } = req.body ?? {};
  io.to(liveRoom(req.params.streamId)).emit("live:status", { streamId: req.params.streamId, status });
  res.json({ ok: true });
});

server.listen(env.port, () => {
  console.log(`[nyumba-realtime] listening on :${env.port}`);
});

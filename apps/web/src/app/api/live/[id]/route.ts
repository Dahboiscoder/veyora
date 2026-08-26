import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { realtimeInternal } from "@/lib/realtime/internal";
import { getLiveStreamDetail } from "@/lib/live/getLiveStream";

export const GET = withErrorHandling(async (_req, { params }: { params: { id: string } }) => {
  const stream = await getLiveStreamDetail(params.id);
  if (!stream) return jsonError("Live tour not found", 404);
  return NextResponse.json(stream);
});

const updateSchema = z.object({ status: z.enum(["LIVE", "ENDED", "CANCELED"]) });

export const PATCH = withErrorHandling(async (req, { params }: { params: { id: string } }) => {
  const user = await requireUser();
  const stream = await prisma.liveStream.findUnique({ where: { id: params.id } });
  if (!stream) return jsonError("Live tour not found", 404);
  if (stream.hostId !== user.id && user.role !== "ADMIN") return jsonError("You cannot manage this live tour", 403);

  const { status } = updateSchema.parse(await req.json());

  const updated = await prisma.liveStream.update({
    where: { id: params.id },
    data: {
      status,
      startedAt: status === "LIVE" && !stream.startedAt ? new Date() : stream.startedAt,
      endedAt: status === "ENDED" ? new Date() : stream.endedAt,
    },
  });

  await realtimeInternal.liveStatus(params.id, status);

  return NextResponse.json(updated);
});

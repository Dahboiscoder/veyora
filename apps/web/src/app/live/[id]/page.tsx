import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveStreamDetail } from "@/lib/live/getLiveStream";
import { serializeProperty } from "@/lib/properties/serialize";
import { LiveRoomClient } from "@/components/live/LiveRoomClient";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const stream = await getLiveStreamDetail(params.id);
  return { title: stream ? `🔴 ${stream.title}` : "Live tour" };
}

export default async function LiveRoomPage({ params }: { params: { id: string } }) {
  const stream = await getLiveStreamDetail(params.id);
  if (!stream) notFound();

  const serialized = {
    ...stream,
    property: serializeProperty(stream.property),
    chatMessages: stream.chatMessages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
  };

  return <LiveRoomClient stream={serialized as any} />;
}

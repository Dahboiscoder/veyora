"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bed, Maximize, MapPin, Radio, Users, CalendarClock } from "lucide-react";
import { formatPrice } from "@nyumba/shared";
import { useSocket } from "@/hooks/useSocket";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { ScheduleViewingModal } from "@/components/property/ScheduleViewingModal";
import { LiveChat, type LiveChatMessage } from "@/components/live/LiveChat";
import { initials } from "@/lib/utils";
import type { PropertyCardData } from "@/types/property";

export interface LiveStreamDetail {
  id: string;
  title: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELED";
  currentViewers: number;
  peakViewers: number;
  host: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
    whatsapp: string | null;
    verificationStatus: string;
    _count: { properties: number; agentFollowers: number };
  };
  property: PropertyCardData;
  chatMessages: LiveChatMessage[];
}

export function LiveRoomClient({ stream }: { stream: LiveStreamDetail }) {
  const { socket } = useSocket();
  const [viewers, setViewers] = useState(stream.currentViewers);
  const [status, setStatus] = useState(stream.status);
  const [viewingOpen, setViewingOpen] = useState(false);

  useEffect(() => {
    socket.emit("live:join", { streamId: stream.id });

    const onViewers = (payload: { streamId: string; count: number }) => {
      if (payload.streamId === stream.id) setViewers(payload.count);
    };
    const onStatus = (payload: { streamId: string; status: LiveStreamDetail["status"] }) => {
      if (payload.streamId === stream.id) setStatus(payload.status);
    };
    socket.on("live:viewers", onViewers);
    socket.on("live:status", onStatus);

    return () => {
      socket.emit("live:leave", { streamId: stream.id });
      socket.off("live:viewers", onViewers);
      socket.off("live:status", onStatus);
    };
  }, [socket, stream.id]);

  const video = stream.property.media.find((m) => m.type === "VIDEO");
  const image = stream.property.media.find((m) => m.isPrimary) ?? stream.property.media[0];
  const ended = status === "ENDED" || status === "CANCELED";

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
      <div>
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          {video ? (
            <video src={video.url} autoPlay loop muted playsInline className="h-full w-full object-cover" />
          ) : image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt={stream.property.title} className="h-full w-full object-cover" />
          ) : null}

          {ended ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-center">
              <p className="font-display text-xl font-semibold text-white">This tour has ended</p>
              <Link href={`/property/${stream.property.slug}`} className="btn-primary mt-2 !px-4 !py-2 text-sm">
                View property
              </Link>
            </div>
          ) : (
            <>
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">
                <Radio className="h-3.5 w-3.5" /> LIVE
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                <Users className="h-3.5 w-3.5" /> {viewers} watching
              </div>
            </>
          )}
        </div>

        <div className="mt-5">
          <h1 className="font-display text-2xl font-semibold text-white">{stream.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold">
              {stream.host.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stream.host.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(stream.host.name)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{stream.host.name}</p>
              <p className="text-xs text-white/45">{stream.host._count.properties} listings · {stream.host._count.agentFollowers} followers</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 p-4 lg:hidden">
          <LiveChat streamId={stream.id} socket={socket} initialMessages={stream.chatMessages} className="h-96" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="glass-card p-4">
          <Link href={`/property/${stream.property.slug}`} className="flex gap-3">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-white">
                {formatPrice(stream.property.price, stream.property.currencyCode, stream.property.priceNote)}
              </p>
              <p className="line-clamp-1 text-xs text-white/60">{stream.property.title}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/40">
                <MapPin className="h-3 w-3" /> {stream.property.city.name}
              </p>
            </div>
          </Link>
          <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3 text-xs text-white/50">
            {stream.property.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {stream.property.bedrooms}
              </span>
            )}
            {stream.property.sizeSqm !== null && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" /> {stream.property.sizeSqm}m²
              </span>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <FavoriteButton propertyId={stream.property.id} className="!h-10 flex-1 !w-full !rounded-xl" />
            <button onClick={() => setViewingOpen(true)} className="btn-secondary flex-[2] !py-2.5 text-sm">
              <CalendarClock className="h-4 w-4" /> Schedule viewing
            </button>
          </div>
        </div>

        <div className="glass-card hidden flex-1 overflow-hidden lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Live chat</p>
          </div>
          <LiveChat streamId={stream.id} socket={socket} initialMessages={stream.chatMessages} className="flex-1" />
        </div>
      </div>

      <ScheduleViewingModal open={viewingOpen} onClose={() => setViewingOpen(false)} propertyId={stream.property.id} />
    </div>
  );
}

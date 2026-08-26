import Link from "next/link";
import Image from "next/image";
import { Radio, Users, CalendarClock } from "lucide-react";
import { prisma } from "@nyumba/db";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "Live Property Tours" };
export const revalidate = 15;

export default async function LivePage() {
  const [live, scheduled] = await Promise.all([
    prisma.liveStream.findMany({
      where: { status: "LIVE" },
      orderBy: { currentViewers: "desc" },
      select: {
        id: true,
        title: true,
        currentViewers: true,
        host: { select: { name: true, avatarUrl: true } },
        property: { select: { title: true, slug: true, city: { select: { name: true } }, media: { where: { type: "IMAGE" }, take: 1, orderBy: { order: "asc" } } } },
      },
    }),
    prisma.liveStream.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { scheduledFor: "asc" },
      select: {
        id: true,
        title: true,
        scheduledFor: true,
        host: { select: { name: true, avatarUrl: true } },
        property: { select: { title: true, slug: true, city: { select: { name: true } }, media: { where: { type: "IMAGE" }, take: 1, orderBy: { order: "asc" } } } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="section-label mb-2 flex items-center justify-center gap-2">
          <span className="live-dot" /> {live.length} tours live right now
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white">Live Property Tours</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/50">
          Join agents in real time, ask questions in chat, and schedule a private viewing on the spot.
        </p>
      </div>

      {live.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {live.map((stream) => (
            <Link
              key={stream.id}
              href={`/live/${stream.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10"
            >
              {stream.property.media[0] && (
                <Image
                  src={stream.property.media[0].url}
                  alt={stream.property.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                <Radio className="h-3 w-3" /> LIVE
              </div>
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                <Users className="h-3 w-3" /> {stream.currentViewers}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="line-clamp-2 text-sm font-semibold text-white">{stream.property.title}</p>
                <p className="mt-1 text-xs text-white/60">{stream.property.city.name} · {stream.host.name}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-white/40">
          No live tours right now — check the upcoming schedule below.
        </div>
      )}

      {scheduled.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 font-display text-2xl font-semibold text-white">Upcoming tours</h2>
          <div className="flex flex-col gap-3">
            {scheduled.map((stream) => (
              <Link
                key={stream.id}
                href={`/property/${stream.property.slug}`}
                className="glass-card flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.06]"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                  {stream.property.media[0] && (
                    <Image src={stream.property.media[0].url} alt="" fill sizes="96px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{stream.title}</p>
                  <p className="text-xs text-white/50">{stream.property.city.name} · hosted by {stream.host.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-ember-400">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {stream.scheduledFor && formatDistanceToNow(new Date(stream.scheduledFor), { addSuffix: true })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

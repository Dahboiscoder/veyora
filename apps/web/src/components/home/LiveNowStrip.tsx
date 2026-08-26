import Link from "next/link";
import Image from "next/image";
import { Radio, Users } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export interface LiveStreamCardData {
  id: string;
  title: string;
  currentViewers: number;
  property: {
    slug: string;
    title: string;
    city: { name: string };
    media: { url: string }[];
  };
  host: { name: string; avatarUrl: string | null };
}

export function LiveNowStrip({ streams }: { streams: LiveStreamCardData[] }) {
  if (streams.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Happening now"
        title="Live property tours"
        description="Hop into a live walkthrough, chat with the agent, and ask questions in real time."
        href="/live"
        linkLabel="See all live tours"
      />
      <div className="no-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-2">
        {streams.map((stream) => (
          <Link
            key={stream.id}
            href={`/live/${stream.id}`}
            className="group relative aspect-[9/16] w-56 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:w-64"
          >
            {stream.property.media[0] && (
              <Image
                src={stream.property.media[0].url}
                alt={stream.property.title}
                fill
                sizes="256px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40" />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
              <Radio className="h-3 w-3" /> LIVE
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur">
              <Users className="h-3 w-3" /> {stream.currentViewers}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="line-clamp-2 text-sm font-semibold text-white">{stream.property.title}</p>
              <p className="mt-1 text-xs text-white/60">{stream.property.city.name} · hosted by {stream.host.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

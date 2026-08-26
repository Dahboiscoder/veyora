"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bed, MapPin, MessageCircle, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { formatPrice, LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@nyumba/shared";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { ShareButton } from "@/components/property/ShareButton";
import { LiveBadge, TourBadge, VerifiedBadge } from "@/components/property/PropertyBadges";
import type { PropertyCardData } from "@/types/property";
import { cn } from "@/lib/utils";

export function FeedSlide({
  property,
  active,
  muted,
  onToggleMute,
}: {
  property: PropertyCardData;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = property.media.find((m) => m.type === "VIDEO");
  const image = property.media.find((m) => m.isPrimary) ?? property.media.find((m) => m.type === "IMAGE");
  const has3DTour = property.media.some((m) => m.type === "MODEL_3D");
  const liveStream = property.liveStreams[0];

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) {
      el.currentTime = 0;
      el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <div className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden bg-void-950">
      {video ? (
        <video
          ref={videoRef}
          src={video.url}
          poster={image?.url}
          muted={muted}
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      ) : image ? (
        <div className={cn("h-full w-full", active && "animate-[kenburns_18s_ease-in-out_infinite]")}>
          <Image src={image.url} alt={property.title} fill sizes="100vw" className="object-cover" priority={active} />
        </div>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-void-800 to-void-950" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

      {video && (
        <button
          onClick={onToggleMute}
          className="absolute right-4 top-6 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          {muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
        </button>
      )}

      <div className="absolute left-4 top-6 z-10 flex flex-wrap gap-1.5">
        {liveStream && <LiveBadge viewers={liveStream.currentViewers} />}
        {has3DTour && <TourBadge />}
        {property.verificationStatus === "VERIFIED" && <VerifiedBadge />}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 pb-24 sm:pb-8">
        <div className="min-w-0 max-w-md text-white">
          <p className="font-display text-2xl font-bold">{formatPrice(property.price, property.currencyCode, property.priceNote)}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold">{property.title}</h3>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-white/70">
            <MapPin className="h-3.5 w-3.5" /> {property.city.name}, {property.country.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="chip !bg-white/10">{LISTING_TYPE_LABELS[property.listingType]}</span>
            <span className="chip !bg-white/10">{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</span>
            {property.bedrooms !== null && (
              <span className="chip !bg-white/10">
                <Bed className="h-3 w-3" /> {property.bedrooms}
              </span>
            )}
          </div>
          <Link href={`/property/${property.slug}`} className="btn-primary mt-4 !px-4 !py-2 text-sm">
            View Property <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <FavoriteButton propertyId={property.id} className="!h-12 !w-12" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShareButton title={property.title} className="!h-12 !w-12" />
          </div>
          <Link
            href={`/property/${property.slug}#contact`}
            className="grid h-12 w-12 place-items-center rounded-full glass transition-transform hover:scale-110"
            aria-label="Contact agent"
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/30">
            {property.owner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={property.owner.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

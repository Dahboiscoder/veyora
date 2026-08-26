import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import { formatPrice, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from "@nyumba/shared";
import { FavoriteButton } from "./FavoriteButton";
import { FeaturedBadge, LiveBadge, TourBadge, VerifiedBadge } from "./PropertyBadges";
import type { PropertyCardData } from "@/types/property";
import { cn } from "@/lib/utils";

export function PropertyCard({ property, className }: { property: PropertyCardData; className?: string }) {
  const primaryMedia =
    property.media.find((m) => m.isPrimary && m.type === "IMAGE") ?? property.media.find((m) => m.type === "IMAGE");
  const has3DTour = property.media.some((m) => m.type === "MODEL_3D");
  const liveStream = property.liveStreams[0];

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-void-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-glass",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-void-800">
        {primaryMedia ? (
          <Image
            src={primaryMedia.url}
            alt={property.title}
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-void-800 to-void-900 text-white/20">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {liveStream && <LiveBadge viewers={liveStream.currentViewers} />}
          {property.isFeatured && <FeaturedBadge />}
          {has3DTour && <TourBadge />}
        </div>
        <FavoriteButton propertyId={property.id} size="sm" className="absolute right-3 top-3" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="chip !bg-black/50 backdrop-blur">{LISTING_TYPE_LABELS[property.listingType]}</span>
          {property.verificationStatus === "VERIFIED" && <VerifiedBadge />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-display text-lg font-semibold text-white">
          {formatPrice(property.price, property.currencyCode, property.priceNote)}
        </p>
        <h3 className="line-clamp-1 text-sm font-medium text-white/90">{property.title}</h3>
        <p className="flex items-center gap-1 text-xs text-white/50">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.city.name}, {property.country.name}
          </span>
        </p>

        <div className="mt-1 flex items-center gap-3 border-t border-white/10 pt-3 text-xs text-white/60">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
            </span>
          )}
          {property.sizeSqm !== null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {property.sizeSqm}m²
            </span>
          )}
          <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5">{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</span>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-void-900/60">
      <div className="aspect-[4/3] w-full animate-pulse bg-white/5" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

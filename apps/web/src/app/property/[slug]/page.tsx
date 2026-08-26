import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Bath, Bed, Building2, Calendar, MapPin, Maximize, Ruler, Sofa, Car } from "lucide-react";
import { prisma } from "@nyumba/db";
import { formatPrice, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from "@nyumba/shared";
import { findPropertyByIdOrSlug, recordPropertyView, getSimilarProperties } from "@/lib/properties/getProperty";
import { serializeProperty } from "@/lib/properties/serialize";
import { getCurrentUser } from "@/lib/auth/session";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { ContactAgentCard } from "@/components/property/ContactAgentCard";
import { ReviewsSection } from "@/components/property/ReviewsSection";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { timeAgo } from "@/lib/utils";

const PropertyMap = dynamic(() => import("@/components/map/PropertyMap").then((m) => m.PropertyMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />,
});

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const property = await findPropertyByIdOrSlug(params.slug);
  if (!property) return { title: "Property not found" };
  const image = property.media.find((m) => m.type === "IMAGE")?.url;
  return {
    title: property.title,
    description: property.description.slice(0, 155),
    openGraph: { title: property.title, description: property.description.slice(0, 155), images: image ? [image] : [] },
  };
}

const FACT_ICON = { bedrooms: Bed, bathrooms: Bath, parking: Car, size: Maximize, land: Ruler, furnished: Sofa, year: Calendar, type: Building2 };

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = await findPropertyByIdOrSlug(params.slug);
  if (!property) notFound();

  const user = await getCurrentUser();

  const [isFavorited, similar] = await Promise.all([
    user
      ? prisma.favorite
          .findUnique({ where: { userId_propertyId: { userId: user.id, propertyId: property.id } } })
          .then((f) => !!f)
      : Promise.resolve(false),
    getSimilarProperties(property),
  ]);

  if (property.status === "PUBLISHED") {
    await recordPropertyView(property.id, user?.id, "detail");
  }

  const facts = [
    property.bedrooms !== null && { key: "bedrooms", label: "Bedrooms", value: property.bedrooms },
    property.bathrooms !== null && { key: "bathrooms", label: "Bathrooms", value: property.bathrooms },
    property.parkingSpaces !== null && { key: "parking", label: "Parking", value: property.parkingSpaces },
    property.sizeSqm !== null && { key: "size", label: "Size", value: `${property.sizeSqm} m²` },
    property.landSizeSqm !== null && { key: "land", label: "Land size", value: `${property.landSizeSqm} m²` },
    property.furnished && { key: "furnished", label: "Furnished", value: property.furnished.replace("_", "-").toLowerCase() },
    property.yearBuilt !== null && { key: "year", label: "Year built", value: property.yearBuilt },
  ].filter(Boolean) as { key: keyof typeof FACT_ICON; label: string; value: string | number }[];

  const liveStreamId = property.liveStreams[0]?.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
        <span>{property.country.name}</span> <span>/</span> <span>{property.city.name}</span> <span>/</span>{" "}
        <span className="text-white/60">{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</span>
      </nav>

      <PropertyGallery
        media={property.media}
        title={property.title}
        isFeatured={property.isFeatured}
        isVerified={property.verificationStatus === "VERIFIED"}
        propertyId={property.id}
        isFavorited={isFavorited}
        liveStreamId={liveStreamId}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="chip">{LISTING_TYPE_LABELS[property.listingType]}</span>
                <span className="chip">{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">{property.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/50">
                <MapPin className="h-4 w-4" />
                {property.district ? `${property.district}, ` : ""}
                {property.city.name}, {property.country.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold text-white">
                {formatPrice(property.price, property.currencyCode, property.priceNote)}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {property.viewCount.toLocaleString()} views · {property._count.favorites} saves
              </p>
            </div>
          </div>

          {facts.length > 0 && (
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 py-6 sm:grid-cols-4">
              {facts.map((fact) => {
                const Icon = FACT_ICON[fact.key];
                return (
                  <div key={fact.key} className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                      <Icon className="h-4 w-4 text-ember-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize text-white">{fact.value}</p>
                      <p className="text-[11px] text-white/40">{fact.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-b border-white/10 py-6">
            <h2 className="mb-3 font-display text-xl font-semibold text-white">About this property</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">{property.description}</p>
          </div>

          {property.amenities.length > 0 && (
            <div className="border-b border-white/10 py-6">
              <h2 className="mb-3 font-display text-xl font-semibold text-white">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="chip">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-b border-white/10 py-6">
            <h2 className="mb-3 font-display text-xl font-semibold text-white">Location</h2>
            <div className="h-80">
              <PropertyMap properties={[serializeProperty(property) as any]} height="100%" />
            </div>
          </div>

          <div className="py-6">
            <ReviewsSection propertyId={property.id} initialReviews={property.reviews as any} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ContactAgentCard agent={property.owner} company={property.company} propertyId={property.id} propertyTitle={property.title} />
          <p className="mt-4 text-center text-xs text-white/30">Listed {timeAgo(property.publishedAt ?? property.createdAt)}</p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-white/10 pt-12">
          <SectionHeading eyebrow="You might also like" title="Similar properties" />
          <PropertyGrid properties={similar as any} columns={4} />
        </section>
      )}
    </div>
  );
}

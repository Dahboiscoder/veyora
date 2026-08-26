import { SectionHeading } from "./SectionHeading";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { PropertyCardData } from "@/types/property";

export function FeaturedProperties({ properties }: { properties: PropertyCardData[] }) {
  if (properties.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Handpicked"
        title="Featured properties"
        description="Verified listings our team and community are watching closely right now."
        href="/listings"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

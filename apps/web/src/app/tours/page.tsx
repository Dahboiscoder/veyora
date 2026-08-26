import { Box, View } from "lucide-react";
import { prisma } from "@nyumba/db";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";
import { PropertyGrid } from "@/components/listings/PropertyGrid";

export const metadata = { title: "3D & 360° Property Tours" };
export const revalidate = 60;

export default async function ToursPage() {
  const [models, panoramas] = await Promise.all([
    prisma.property.findMany({
      where: { status: "PUBLISHED", media: { some: { type: "MODEL_3D" } } },
      orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
      take: 24,
      select: PROPERTY_CARD_SELECT,
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED", media: { some: { type: { in: ["IMAGE_360", "VIDEO_360"] } } } },
      orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }],
      take: 24,
      select: PROPERTY_CARD_SELECT,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="section-label mb-2">Immersive discovery</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white">Walk through before you visit</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/50">
          Every listing below has a real interactive 3D walkthrough or 360° panorama. Open any property and hit
          "Enter 3D Tour" or "View 360° Tour" to move around it yourself.
        </p>
      </div>

      <section className="mb-16">
        <div className="mb-6 flex items-center gap-2">
          <Box className="h-5 w-5 text-ember-400" />
          <h2 className="font-display text-xl font-semibold text-white">3D walkthroughs</h2>
        </div>
        <PropertyGrid properties={models as any} columns={4} />
      </section>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <View className="h-5 w-5 text-aurora-400" />
          <h2 className="font-display text-xl font-semibold text-white">360° panoramas</h2>
        </div>
        <PropertyGrid properties={panoramas as any} columns={4} />
      </section>
    </div>
  );
}

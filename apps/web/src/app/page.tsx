import { prisma } from "@nyumba/db";
import { Hero } from "@/components/home/Hero";
import { CountryStrip } from "@/components/home/CountryStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { LiveNowStrip } from "@/components/home/LiveNowStrip";
import { ListCta } from "@/components/home/ListCta";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";

export const revalidate = 60;

async function getHomeData() {
  const [featured, liveStreams] = await Promise.all([
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { verificationStatus: "desc" }, { viewCount: "desc" }],
      take: 8,
      select: PROPERTY_CARD_SELECT,
    }),
    prisma.liveStream.findMany({
      where: { status: "LIVE" },
      orderBy: { currentViewers: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        currentViewers: true,
        host: { select: { name: true, avatarUrl: true } },
        property: {
          select: {
            slug: true,
            title: true,
            city: { select: { name: true } },
            media: { where: { type: "IMAGE" }, orderBy: { order: "asc" }, take: 1, select: { url: true } },
          },
        },
      },
    }),
  ]);

  return { featured, liveStreams };
}

export default async function HomePage() {
  const { featured, liveStreams } = await getHomeData();

  return (
    <>
      <Hero />
      <CountryStrip />
      <CategoryGrid />
      <FeaturedProperties properties={featured as any} />
      <LiveNowStrip streams={liveStreams as any} />
      <FeatureShowcase />
      <ListCta />
    </>
  );
}

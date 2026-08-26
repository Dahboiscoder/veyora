import { prisma } from "@nyumba/db";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";
import { serializeProperties } from "@/lib/properties/serialize";
import { VideoFeed } from "@/components/feed/VideoFeed";

export const metadata = { title: "Video Feed" };

export default async function FeedPage() {
  const properties = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 20,
    select: PROPERTY_CARD_SELECT,
  });

  return <VideoFeed initialProperties={serializeProperties(properties) as any} />;
}

import { prisma } from "@nyumba/db";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";

export function getLiveStreamDetail(id: string) {
  return prisma.liveStream.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      scheduledFor: true,
      startedAt: true,
      endedAt: true,
      currentViewers: true,
      peakViewers: true,
      host: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          whatsapp: true,
          phone: true,
          bio: true,
          verificationStatus: true,
          _count: { select: { properties: true, agentFollowers: true } },
        },
      },
      property: { select: PROPERTY_CARD_SELECT },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        take: 100,
        select: { id: true, text: true, createdAt: true, user: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      },
    },
  });
}

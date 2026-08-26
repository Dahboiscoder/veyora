import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Building2, Star } from "lucide-react";
import { prisma } from "@nyumba/db";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { FollowAgentButton } from "@/components/agents/FollowAgentButton";
import { MessageAgentButton } from "@/components/agents/MessageAgentButton";
import { initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const agent = await prisma.user.findUnique({ where: { id: params.id }, select: { name: true } });
  return { title: agent ? agent.name : "Agent not found" };
}

export default async function AgentProfilePage({ params }: { params: { id: string } }) {
  const agent = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      bio: true,
      verificationStatus: true,
      createdAt: true,
      company: { select: { id: true, name: true, slug: true, logoUrl: true, verificationStatus: true } },
      _count: { select: { properties: true, agentFollowers: true, reviewsReceived: true } },
    },
  });

  if (!agent || !["AGENT", "OWNER"].includes(agent.role)) notFound();

  const [properties, reviews, avgRating] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: agent.id, status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 12,
      select: PROPERTY_CARD_SELECT,
    }),
    prisma.review.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, rating: true, comment: true, createdAt: true, author: { select: { name: true, avatarUrl: true } } },
    }),
    prisma.review.aggregate({ where: { agentId: agent.id }, _avg: { rating: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl font-semibold">
          {agent.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.avatarUrl} alt={agent.name} className="h-full w-full object-cover" />
          ) : (
            initials(agent.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center justify-center gap-1.5 font-display text-2xl font-semibold text-white sm:justify-start">
            {agent.name}
            {agent.verificationStatus === "VERIFIED" && <BadgeCheck className="h-5 w-5 text-aurora-400" />}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {agent.role === "AGENT" ? "Real estate agent" : "Property owner"}
            {agent.company && ` · ${agent.company.name}`}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-white/60 sm:justify-start">
            <span>{agent._count.properties} listings</span>
            <span>{agent._count.agentFollowers} followers</span>
            {avgRating._avg.rating && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-ember-400 text-ember-400" /> {avgRating._avg.rating.toFixed(1)} ({agent._count.reviewsReceived})
              </span>
            )}
          </div>
          {agent.bio && <p className="mt-3 max-w-lg text-sm text-white/60">{agent.bio}</p>}
        </div>
        <FollowAgentButton agentId={agent.id} />
      </div>

      {agent.company && (
        <a
          href={`/companies/${agent.company.slug}`}
          className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05]"
        >
          <Building2 className="h-4 w-4" /> Part of <span className="font-semibold text-white">{agent.company.name}</span>
          {agent.company.verificationStatus === "VERIFIED" && <BadgeCheck className="h-3.5 w-3.5 text-aurora-400" />}
        </a>
      )}

      <section className="mt-10">
        <h2 className="mb-5 font-display text-xl font-semibold text-white">Listings by {agent.name}</h2>
        <PropertyGrid properties={properties as any} columns={4} />
      </section>

      {reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold text-white">Reviews</h2>
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="glass-card flex gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                  {initials(r.author.name)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-ember-400 text-ember-400" : "text-white/20"}`} />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-white/70">{r.comment}</p>
                  <p className="mt-1 text-xs text-white/30">{r.author.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <MessageAgentButton agentId={agent.id} agentName={agent.name} />
    </div>
  );
}

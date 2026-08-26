import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Users } from "lucide-react";
import { prisma } from "@nyumba/db";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { FollowCompanyButton } from "@/components/agents/FollowCompanyButton";
import { initials } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const company = await prisma.company.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: company ? company.name : "Agency not found" };
}

export default async function CompanyProfilePage({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      coverImageUrl: true,
      description: true,
      website: true,
      verificationStatus: true,
      agents: {
        select: { id: true, name: true, avatarUrl: true, verificationStatus: true, _count: { select: { properties: true } } },
      },
      _count: { select: { followers: true, properties: true } },
    },
  });

  if (!company) notFound();

  const properties = await prisma.property.findMany({
    where: { companyId: company.id, status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: 16,
    select: PROPERTY_CARD_SELECT,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative h-40 overflow-hidden rounded-2xl bg-void-800 sm:h-56">
        {company.coverImageUrl && <Image src={company.coverImageUrl} alt="" fill sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-void-950 to-transparent" />
      </div>

      <div className="glass-card -mt-12 flex flex-col items-center gap-4 p-6 text-center sm:-mt-14 sm:flex-row sm:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-void-950 bg-white/10 text-2xl font-semibold">
          {company.logoUrl ? (
            <Image src={company.logoUrl} alt={company.name} width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            initials(company.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center justify-center gap-1.5 font-display text-2xl font-semibold text-white sm:justify-start">
            {company.name}
            {company.verificationStatus === "VERIFIED" && <BadgeCheck className="h-5 w-5 text-aurora-400" />}
          </h1>
          <p className="mt-1 flex items-center justify-center gap-3 text-sm text-white/50 sm:justify-start">
            <span>{company._count.properties} listings</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {company._count.followers} followers
            </span>
          </p>
          {company.description && <p className="mt-3 max-w-xl text-sm text-white/60">{company.description}</p>}
        </div>
        <FollowCompanyButton companyId={company.id} />
      </div>

      {company.agents.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 font-display text-xl font-semibold text-white">Our agents</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {company.agents.map((a) => (
              <a key={a.id} href={`/agents/${a.id}`} className="glass-card flex flex-col items-center gap-2 p-4 text-center hover:bg-white/[0.06]">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold">
                  {a.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(a.name)
                  )}
                </div>
                <p className="flex items-center gap-1 text-sm font-medium text-white">
                  {a.name}
                  {a.verificationStatus === "VERIFIED" && <BadgeCheck className="h-3.5 w-3.5 text-aurora-400" />}
                </p>
                <p className="text-xs text-white/40">{a._count.properties} listings</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-5 font-display text-xl font-semibold text-white">Listings</h2>
        <PropertyGrid properties={properties as any} columns={4} />
      </section>
    </div>
  );
}

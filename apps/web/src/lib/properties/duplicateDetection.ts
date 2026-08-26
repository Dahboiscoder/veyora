import { prisma } from "@nyumba/db";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalize(a).split(" ").filter(Boolean));
  const tokensB = new Set(normalize(b).split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const shared = [...tokensA].filter((t) => tokensB.has(t)).length;
  return shared / Math.max(tokensA.size, tokensB.size);
}

// ~110m at the equator — tight enough that two independent listings landing
// inside it, from the same owner, are far more likely the same property
// re-posted than a genuine coincidence.
const NEARBY_DEGREES = 0.001;

/**
 * Heuristic duplicate check run when an owner/agent publishes a listing:
 * same owner + (near-identical address, or near-identical coordinates, or
 * a highly similar title) against their own other live listings. Flags for
 * admin review rather than blocking the publish — it's a heuristic, so
 * false positives are expected and get resolved by a human, not silently
 * enforced.
 */
export async function findLikelyDuplicate(property: {
  id: string;
  ownerId: string;
  title: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}) {
  const candidates = await prisma.property.findMany({
    where: {
      ownerId: property.ownerId,
      id: { not: property.id },
      status: { in: ["PUBLISHED", "PENDING_REVIEW"] },
    },
    select: { id: true, title: true, address: true, lat: true, lng: true },
  });

  for (const candidate of candidates) {
    const sameAddress =
      !!property.address && !!candidate.address && normalize(property.address) === normalize(candidate.address);

    const sameLocation =
      property.lat != null &&
      property.lng != null &&
      candidate.lat != null &&
      candidate.lng != null &&
      Math.abs(property.lat - candidate.lat) < NEARBY_DEGREES &&
      Math.abs(property.lng - candidate.lng) < NEARBY_DEGREES;

    const similarTitle = titleSimilarity(property.title, candidate.title) >= 0.7;

    if (sameAddress || sameLocation || similarTitle) return candidate;
  }
  return null;
}

export async function flagPossibleDuplicate(propertyId: string, duplicateOfId: string) {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  if (!admin) return;

  const alreadyFlagged = await prisma.report.findFirst({
    where: { propertyId, reason: "DUPLICATE", status: "PENDING" },
    select: { id: true },
  });
  if (alreadyFlagged) return;

  await prisma.report.create({
    data: {
      reporterId: admin.id,
      propertyId,
      reason: "DUPLICATE",
      details: `Auto-flagged by duplicate detection: closely matches listing ${duplicateOfId} from the same owner.`,
    },
  });
}

import { Prisma } from "@nyumba/db";
import { parseSearchQuery, type PropertySearchInput } from "@nyumba/shared";

export async function resolveSearchFilters(input: PropertySearchInput) {
  const filters = { ...input };

  if (filters.q) {
    const parsed = parseSearchQuery(filters.q);
    filters.category = filters.category ?? (parsed.category as any);
    filters.type = filters.type ?? parsed.type;
    filters.listingType = filters.listingType ?? parsed.listingType;
    filters.bedrooms = filters.bedrooms ?? parsed.bedrooms;
    filters.bathrooms = filters.bathrooms ?? parsed.bathrooms;
    filters.minPrice = filters.minPrice ?? parsed.minPrice;
    filters.maxPrice = filters.maxPrice ?? parsed.maxPrice;
    filters.furnished = filters.furnished ?? (parsed.furnished as any);
    filters.verifiedOnly = filters.verifiedOnly ?? parsed.verifiedOnly;
    filters.has3DTour = filters.has3DTour ?? parsed.has3DTour;
    filters.hasVideo = filters.hasVideo ?? parsed.hasVideo;
    filters.isLive = filters.isLive ?? parsed.isLive;
    filters.countryCode = filters.countryCode ?? parsed.countryCode;
    (filters as any)._cityName = parsed.cityName;
    filters.q = parsed.remainder || undefined;
  }

  return filters;
}

export function buildPropertyWhere(
  filters: PropertySearchInput & { _cityName?: string },
  overrides?: Prisma.PropertyWhereInput
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: "PUBLISHED",
    ...overrides,
  };

  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type as any;
  if (filters.listingType) where.listingType = filters.listingType;
  if (filters.furnished) where.furnished = filters.furnished;
  if (filters.verifiedOnly) where.verificationStatus = "VERIFIED";
  if (filters.bedrooms !== undefined) where.bedrooms = { gte: filters.bedrooms };
  if (filters.bathrooms !== undefined) where.bathrooms = { gte: filters.bathrooms };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.currencyCode) where.currencyCode = filters.currencyCode;

  if (filters.countryCode) where.country = { code: filters.countryCode };
  if (filters.cityId) where.cityId = filters.cityId;
  const cityName = filters.cityName ?? filters._cityName;
  if (cityName) where.city = { name: { equals: cityName, mode: "insensitive" } };

  if (filters.amenities && filters.amenities.length > 0) {
    where.amenities = { hasEvery: filters.amenities };
  }

  if (filters.has3DTour) where.media = { some: { type: "MODEL_3D" } };
  if (filters.hasVideo) where.media = { ...(where.media as object), some: { type: "VIDEO" } };
  if (filters.isLive) where.liveStreams = { some: { status: "LIVE" } };

  if (filters.bounds) {
    where.lat = { gte: filters.bounds.south, lte: filters.bounds.north };
    where.lng = { gte: filters.bounds.west, lte: filters.bounds.east };
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { district: { contains: filters.q, mode: "insensitive" } },
      { address: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export function buildPropertyOrderBy(sort: PropertySearchInput["sort"]): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ publishedAt: "desc" }];
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "most_viewed":
      return [{ viewCount: "desc" }];
    case "most_liked":
      return [{ likeCount: "desc" }];
    case "recommended":
    default:
      return [{ isFeatured: "desc" }, { verificationStatus: "desc" }, { viewCount: "desc" }, { publishedAt: "desc" }];
  }
}

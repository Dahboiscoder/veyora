import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma, Prisma } from "@nyumba/db";
import { propertyCreateSchema, propertySearchSchema, CAN_LIST_ROLES } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api/response";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/select";
import { buildPropertyOrderBy, buildPropertyWhere, resolveSearchFilters } from "@/lib/properties/query";
import { slugify } from "@/lib/utils";

export const GET = withErrorHandling(async (req) => {
  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsedAmenities = url.searchParams.getAll("amenities");
  const input = propertySearchSchema.parse({
    ...raw,
    amenities: parsedAmenities.length ? parsedAmenities : undefined,
  });

  const filters = await resolveSearchFilters(input);
  const where = buildPropertyWhere(filters);
  const orderBy = buildPropertyOrderBy(filters.sort);

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      select: PROPERTY_CARD_SELECT,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    appliedFilters: filters,
  });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser(CAN_LIST_ROLES);
  const body = propertyCreateSchema.parse(await req.json());

  // Validate the FKs exist up front so a bad countryId/cityId comes back as
  // a clean 404 rather than a raw Prisma foreign-key-constraint error.
  await Promise.all([
    prisma.country.findUniqueOrThrow({ where: { id: body.countryId } }),
    prisma.city.findUniqueOrThrow({ where: { id: body.cityId } }),
  ]);

  const slug = `${slugify(body.title)}-${nanoid(6).toLowerCase()}`;

  const property = await prisma.property.create({
    data: {
      ...body,
      slug,
      ownerId: user.id,
      companyId: user.companyId ?? undefined,
    } as Prisma.PropertyUncheckedCreateInput,
    select: PROPERTY_CARD_SELECT,
  });

  return NextResponse.json(property, { status: 201 });
});

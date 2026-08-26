import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Photo IDs pulled from the same hand-verified Unsplash pools used by
// prisma/seed.ts (RESIDENTIAL_EXTERIOR / RESIDENTIAL_INTERIOR / LAND_PHOTOS)
// so these listings render real house/interior/land photography, not
// abstract placeholders.
function unsplash(id: string, w = 1400, h = 933) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${w}&h=${h}&fit=crop&auto=format`;
}

const listings = [
  {
    slug: "nyarutarama-luxury-villa-golf-course",
    title: "4-Bedroom Villa Overlooking Nyarutarama Golf Course",
    description:
      "A gated, single-owner villa in Nyarutarama — Kigali's most established upscale neighbourhood, built up around the golf course and long favoured by diplomats and senior executives. Four ensuite bedrooms, a staff wing with separate servant quarters, mature landscaped garden, and a private pool. Backup generator and borehole water keep the house running independent of city outages, and the compound is walled with 24/7 guarded gated access, typical of this part of the city.",
    category: "RESIDENTIAL", type: "VILLA", listingType: "SALE",
    price: 320_000_000, priceNote: undefined as string | undefined,
    district: "Nyarutarama", address: "Nyarutarama, near Kigali Golf Club, Gasabo",
    latOffset: [-0.006, 0.045],
    bedrooms: 4, bathrooms: 4, parkingSpaces: 3, sizeSqm: 420, landSizeSqm: 900, yearBuilt: 2016,
    furnished: "UNFURNISHED", amenities: ["Swimming Pool", "Gated Community", "24/7 Security", "Backup Generator", "Servant Quarters", "Garden", "CCTV", "Borehole / Water Tank"],
  },
  {
    slug: "kimihurura-serviced-apartment-for-rent",
    title: "3-Bedroom Serviced Apartment in Kimihurura",
    description:
      "Fully furnished 3-bedroom apartment in Kimihurura, the leafy, embassy-adjacent district that's become Kigali's go-to for long-staying expats and NGO staff who want to be minutes from town without living downtown. Building has fibre internet, a backup generator for the whole block, elevator access, and a small gym. Walking distance to Kimihurura's restaurant strip.",
    category: "RESIDENTIAL", type: "SERVICED_APARTMENT", listingType: "RENT",
    price: 3_500_000, priceNote: "/ month",
    district: "Kimihurura", address: "Kimihurura, KG 7 Ave area, Gasabo",
    latOffset: [0.001, -0.024],
    bedrooms: 3, bathrooms: 3, parkingSpaces: 2, sizeSqm: 180, landSizeSqm: undefined, yearBuilt: 2020,
    furnished: "FURNISHED", amenities: ["Fibre Internet", "Backup Generator", "Elevator", "Gym", "Balcony", "24/7 Security", "Air Conditioning"],
  },
  {
    slug: "kacyiru-apartment-near-embassies",
    title: "2-Bedroom Apartment in Kacyiru, Near the Embassy District",
    description:
      "Quiet 2-bedroom apartment in Kacyiru, next to Rwanda's government ministries and embassy row — a short commute for anyone working in diplomacy, government relations, or the nearby international organisations. Solar-assisted hot water, fibre internet pre-installed, and a gated compound shared with three other units.",
    category: "RESIDENTIAL", type: "APARTMENT", listingType: "RENT",
    price: 1_400_000, priceNote: "/ month",
    district: "Kacyiru", address: "Kacyiru, near the ministries quarter, Gasabo",
    latOffset: [0.002, -0.030],
    bedrooms: 2, bathrooms: 2, parkingSpaces: 1, sizeSqm: 95, landSizeSqm: undefined, yearBuilt: 2018,
    furnished: "SEMI_FURNISHED", amenities: ["Fibre Internet", "Solar Power", "Gated Community", "24/7 Security", "Balcony"],
  },
  {
    slug: "gacuriro-vision-city-townhouse",
    title: "3-Bedroom Townhouse in Gacuriro (Vision City)",
    description:
      "Modern townhouse inside the Vision City development in Gacuriro — a planned, mid-market community popular with young professionals and dual-income families, built around shared green space and estate-wide security rather than individually walled plots. Open-plan kitchen/living area, small private garden, and covered parking for two cars.",
    category: "RESIDENTIAL", type: "TOWNHOUSE", listingType: "SALE",
    price: 145_000_000, priceNote: undefined,
    district: "Gacuriro", address: "Vision City, Gacuriro, Gasabo",
    latOffset: [0.026, 0.021],
    bedrooms: 3, bathrooms: 3, parkingSpaces: 2, sizeSqm: 210, landSizeSqm: 300, yearBuilt: 2021,
    furnished: "UNFURNISHED", amenities: ["Gated Community", "24/7 Security", "Garden", "Fibre Internet", "Backup Generator"],
  },
  {
    slug: "kanombe-residential-land-plot",
    title: "500 sqm Residential Plot in Kanombe",
    description:
      "Titled residential plot in Kanombe, on Kigali's eastern side near the airport and the growing Kigali Special Economic Zone — an area that's seen steady infrastructure investment as the city expands east. Flat, cleared land ready to build, with road access and a water connection already at the boundary.",
    category: "LAND", type: "RESIDENTIAL_LAND", listingType: "SALE",
    price: 48_000_000, priceNote: undefined,
    district: "Kanombe", address: "Kanombe, near Kigali Special Economic Zone, Kicukiro",
    latOffset: [-0.024, 0.077],
    bedrooms: undefined, bathrooms: undefined, parkingSpaces: undefined, sizeSqm: undefined, landSizeSqm: 500, yearBuilt: undefined,
    furnished: undefined, amenities: ["Borehole / Water Tank"],
  },
  {
    slug: "rubavu-lakeview-house-gisenyi",
    title: "3-Bedroom Lake Kivu View House in Gisenyi",
    description:
      "Three-bedroom house in Gisenyi town (Rubavu district), a short walk from the Lake Kivu shoreline. Rubavu's lakeside setting and steady tourist traffic make properties like this popular as either a family home or a short-stay rental — the same combination of scenery and proximity to the beach that's drawn resorts and guesthouses to this stretch of the lake for years. Covered veranda facing the water side, mature garden, and a small guest annex.",
    category: "RESIDENTIAL", type: "HOUSE", listingType: "SALE",
    price: 185_000_000, priceNote: undefined,
    district: "Gisenyi", address: "Gisenyi, near the Lake Kivu shoreline, Rubavu",
    latOffset: [0.010, -0.012],
    bedrooms: 3, bathrooms: 2, parkingSpaces: 2, sizeSqm: 190, landSizeSqm: 650, yearBuilt: 2012,
    furnished: "SEMI_FURNISHED", amenities: ["Garden", "Balcony", "Borehole / Water Tank", "Backup Generator", "Pet Friendly"],
  },
  {
    slug: "rubavu-lakefront-land-tourism",
    title: "5,988 sqm Lakefront Plot Near Lake Kivu, Rubavu",
    description:
      "Large lakefront plot on the Rubavu shoreline, roughly 5,988 sqm, suited to a lodge, guesthouse, or private lakeside estate given its size and direct water frontage. Rubavu has been one of the more active tourism corridors on Lake Kivu, with hotel and resort development continuing along the shore — this plot sits within that stretch.",
    category: "LAND", type: "COMMERCIAL_LAND", listingType: "SALE",
    price: 120_000_000, priceNote: undefined,
    district: "Rubavu", address: "Lake Kivu shoreline, Rubavu",
    latOffset: [0.016, -0.020],
    bedrooms: undefined, bathrooms: undefined, parkingSpaces: undefined, sizeSqm: undefined, landSizeSqm: 5988, yearBuilt: undefined,
    furnished: undefined, amenities: [],
  },
  {
    slug: "rubavu-affordable-house-gisenyi-town",
    title: "3-Bedroom House in Gisenyi Town",
    description:
      "Compact 3-bedroom house set back from the lakefront in Gisenyi town, Rubavu — an affordable entry point into the area compared to shoreline properties, and still an easy walk or short moto ride to the beach and town centre. Simple concrete construction, small yard, on a quiet residential street.",
    category: "RESIDENTIAL", type: "HOUSE", listingType: "SALE",
    price: 9_500_000, priceNote: undefined,
    district: "Gisenyi", address: "Gisenyi town, Rubavu",
    latOffset: [-0.008, 0.009],
    bedrooms: 3, bathrooms: 1, parkingSpaces: 0, sizeSqm: 85, landSizeSqm: 220, yearBuilt: 2005,
    furnished: "UNFURNISHED", amenities: ["Borehole / Water Tank"],
  },
] as const;

// Same hand-verified pools as prisma/seed.ts.
const RESIDENTIAL_EXTERIOR = [
  "1574931697692-f937f1a4134f", "1531300365552-da5abe58a725", "1745725427804-4d94df0c5eb7",
  "1759256243437-9c8f7238c42b", "1527169809256-51bcc03eef15", "1678410843528-fd83291f8aaf",
];
const RESIDENTIAL_INTERIOR = [
  "1779218404492-0b0546062158", "1784653548958-0a1c29a68993", "1756569620147-67d97c02375c",
  "1784653548946-e7444b1d12d7", "1784653548916-796e08667ba6", "1663811397261-916af74a9363",
];
const LAND_PHOTOS = [
  "1762369879305-59b7b00d8761", "1776090416729-20bedcc1a207", "1597738818779-4b8574d4ed64", "1769366010381-0745aa9324a8",
];

async function main() {
  const rwanda = await prisma.country.findFirstOrThrow({ where: { name: "Rwanda" } });
  const cities = await prisma.city.findMany({ where: { countryId: rwanda.id } });
  const cityByName = new Map(cities.map((c) => [c.name, c]));

  const agent = await prisma.user.findFirstOrThrow({
    where: { email: "agent1@kigali-prime-properties.dev" },
    select: { id: true, companyId: true },
  });

  let created = 0;
  for (const l of listings) {
    const isRubavu = ["Gisenyi", "Rubavu"].includes(l.district);
    const city = cityByName.get(isRubavu ? "Rubavu" : "Kigali")!;

    const existing = await prisma.property.findUnique({ where: { slug: l.slug } });
    if (existing) {
      console.log(`skip (already exists): ${l.slug}`);
      continue;
    }

    const property = await prisma.property.create({
      data: {
        slug: l.slug,
        title: l.title,
        description: l.description,
        category: l.category as any,
        type: l.type as any,
        listingType: l.listingType as any,
        status: "PUBLISHED",
        price: l.price,
        currencyCode: rwanda.currencyCode,
        priceNote: l.priceNote,
        countryId: rwanda.id,
        cityId: city.id,
        district: l.district,
        address: l.address,
        lat: city.lat + l.latOffset[0],
        lng: city.lng + l.latOffset[1],
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        parkingSpaces: l.parkingSpaces,
        sizeSqm: l.sizeSqm,
        landSizeSqm: l.landSizeSqm,
        yearBuilt: l.yearBuilt,
        furnished: l.furnished as any,
        amenities: [...l.amenities],
        ownerId: agent.id,
        companyId: agent.companyId,
        verificationStatus: "VERIFIED",
        isFeatured: false,
        publishedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
      },
    });

    const isLand = l.category === "LAND";
    const pool = isLand ? LAND_PHOTOS : RESIDENTIAL_EXTERIOR;
    const interiorPool = RESIDENTIAL_INTERIOR;
    const photoIds = isLand
      ? [pool[created % pool.length], pool[(created + 1) % pool.length]]
      : [pool[created % pool.length], interiorPool[created % interiorPool.length], interiorPool[(created + 2) % interiorPool.length]];

    await prisma.propertyMedia.createMany({
      data: photoIds.map((photoId, idx) => ({
        propertyId: property.id,
        type: "IMAGE" as const,
        url: unsplash(photoId),
        thumbnailUrl: unsplash(photoId, 480, 320),
        order: idx,
        isPrimary: idx === 0,
      })),
    });

    console.log(`created: ${l.title} (${l.district}) — ${property.id}`);
    created++;
  }

  console.log(`\nDone. ${created} new listing(s) created.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

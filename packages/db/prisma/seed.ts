import "dotenv/config";
import { PrismaClient, type PropertyCategory, type PropertyType, type ListingType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { LAUNCH_COUNTRIES, PROPERTY_TYPES_BY_CATEGORY, AMENITIES } from "@nyumba/shared";

const prisma = new PrismaClient();
faker.seed(1312);

export const DEMO_PASSWORD = "Veyora2026!";

// Verified-reachable (checked at write time), generically-licensed sample
// clips — stand-ins for real walkthrough footage until agents upload their
// own via the real /api/media/presign -> MinIO pipeline.
const SAMPLE_VIDEOS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://download.samplelib.com/mp4/sample-10s.mp4",
  "https://download.samplelib.com/mp4/sample-15s.mp4",
  "https://download.samplelib.com/mp4/sample-20s.mp4",
  "https://download.samplelib.com/mp4/sample-30s.mp4",
];

const PROCEDURAL_STYLES = ["villa", "tower", "bungalow", "cabin", "estate"] as const;
const ACCENTS = ["#f96a1f", "#0cb4db", "#f9c31f", "#22c55e", "#a855f7"];

function picsum(seed: string, w = 1400, h = 933) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

// Real, Unsplash-License photographs (verified reachable + hand-checked to
// actually depict houses/buildings/interiors, not renders or unrelated
// content) — used for property listing photos instead of abstract picsum
// placeholders, so what buyers browse actually looks like real real estate.
function unsplash(id: string, w = 1400, h = 933) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${w}&h=${h}&fit=crop&auto=format`;
}

const RESIDENTIAL_EXTERIOR = [
  "1574931697692-f937f1a4134f",
  "1531300365552-da5abe58a725",
  "1745725427804-4d94df0c5eb7",
  "1759256243437-9c8f7238c42b",
  "1527169809256-51bcc03eef15",
  "1678410843528-fd83291f8aaf",
  "1625664705604-2731f327e27b",
  "1643297551340-19d8ad4f20ad",
  "1681039580747-569f9cd54858",
  "1705858082848-2273a6ef2ec3",
  "1781504798134-31600e8579ba",
  "1710075770057-d1e80eaf99cf",
];
const RESIDENTIAL_INTERIOR = [
  "1779218404492-0b0546062158",
  "1784653548958-0a1c29a68993",
  "1756569620147-67d97c02375c",
  "1784653548946-e7444b1d12d7",
  "1784653548916-796e08667ba6",
  "1663811397261-916af74a9363",
  "1649083048455-01f6827c24d6",
  "1649083048597-d7b4f1e8a386",
  "1690310588533-6043216b0b5f",
  "1649083047855-203d8363d893",
  "1648475235873-963ecc805ee0",
  "1643949700215-e61cdca053f7",
  "1756079664354-34944e001f6d",
  "1771239048293-72abf673adb2",
];
const COMMERCIAL_EXTERIOR = [
  "1637459296722-21d4d4413053",
  "1637459297112-c7479b1beb26",
  "1637459297861-bf14f996c1f7",
  "1637459296723-e589b947ad97",
];
const COMMERCIAL_INTERIOR = [
  "1497366754035-f200968a6e72",
  "1715593949273-09009558300a",
  "1559136555-9303baea8ebd",
  "1504297050568-910d24c426d3",
];
const LAND_PHOTOS = [
  "1762369879305-59b7b00d8761",
  "1776090416729-20bedcc1a207",
  "1597738818779-4b8574d4ed64",
  "1769366010381-0745aa9324a8",
];

let residentialExteriorCursor = 0;
let commercialExteriorCursor = 0;
let landCursor = 0;

function propertyPhotoIds(category: PropertyCategory, count: number): string[] {
  if (category === "LAND") {
    return Array.from({ length: count }, () => LAND_PHOTOS[landCursor++ % LAND_PHOTOS.length]);
  }
  const exteriorPool = category === "COMMERCIAL" ? COMMERCIAL_EXTERIOR : RESIDENTIAL_EXTERIOR;
  const interiorPool = category === "COMMERCIAL" ? COMMERCIAL_INTERIOR : RESIDENTIAL_INTERIOR;
  const cursor = category === "COMMERCIAL" ? commercialExteriorCursor++ : residentialExteriorCursor++;
  const cover = exteriorPool[cursor % exteriorPool.length];

  if (count === 1) return [cover];

  // Every listing with more than one photo gets a guaranteed real interior
  // shot right after the exterior cover — not left to chance — so buyers
  // always see both the outside and the inside, not just whichever the
  // random mix below happens to land on.
  const guaranteedInterior = pick(interiorPool);
  const rest = Array.from({ length: Math.max(0, count - 2) }, () =>
    Math.random() > 0.3 ? pick(interiorPool) : pick(exteriorPool)
  );
  return [cover, guaranteedInterior, ...rest];
}
function avatar(seed: string) {
  return `https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: readonly T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function roundTo(value: number, nearest: number) {
  return Math.round(value / nearest) * nearest;
}

// Rough order-of-magnitude FX rates (USD -> local). Not live rates — the
// app fetches nothing financial from this file; it only exists to make
// seeded prices look locally plausible instead of every country showing
// the same raw number.
const FX_TO_USD: Record<string, number> = {
  RWF: 1300, NGN: 1550, GHS: 15, KES: 129, ZAR: 18,
  UGX: 3700, TZS: 2600, ETB: 120, XAF: 600, XOF: 600,
};

function localPrice(usd: number, currencyCode: string): number {
  const rate = FX_TO_USD[currencyCode] ?? 1;
  const raw = usd * rate;
  const nearest = raw > 1_000_000 ? 100_000 : raw > 100_000 ? 10_000 : raw > 10_000 ? 500 : raw > 1000 ? 50 : 5;
  return roundTo(raw, nearest);
}

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(PROPERTY_TYPES_BY_CATEGORY).flat().map((t) => [t.value, t.label])
);

const ADJECTIVES = [
  "Elegant", "Modern", "Stunning", "Luxurious", "Charming", "Spacious",
  "Executive", "Contemporary", "Serene", "Prime", "Exclusive", "Breathtaking",
];

const RESIDENTIAL_FEATURES = [
  "an open-plan living and dining area bathed in natural light",
  "a chef-inspired kitchen with premium fittings",
  "a private landscaped garden ideal for entertaining",
  "panoramic views over the city skyline",
  "an ensuite master bedroom with a walk-in closet",
  "a secure, gated compound with round-the-clock staff",
  "high ceilings and floor-to-ceiling windows throughout",
  "a rooftop terrace perfect for evening sunsets",
];

const COMMERCIAL_FEATURES = [
  "flexible open-plan floor space ready for fit-out",
  "dedicated visitor parking and loading access",
  "backup power and fibre connectivity already installed",
  "frontage on a high-traffic commercial corridor",
  "a modern reception area and meeting suites",
  "24/7 security and CCTV coverage",
];

const LAND_FEATURES = [
  "flat, buildable terrain with a registered title",
  "road access and proximity to utilities",
  "a quiet setting away from the city center, ideal for development",
  "fertile soil suited to year-round cultivation",
];

function description(category: PropertyCategory, cityName: string, countryName: string, bedrooms?: number) {
  const featurePool = category === "LAND" ? LAND_FEATURES : category === "COMMERCIAL" ? COMMERCIAL_FEATURES : RESIDENTIAL_FEATURES;
  const features = pickN(featurePool, Math.min(3, featurePool.length));
  const intro =
    category === "LAND"
      ? `A prime parcel of land in ${cityName}, ${countryName}, offered with `
      : bedrooms
      ? `A ${bedrooms}-bedroom home in one of ${cityName}'s most sought-after neighborhoods, offering `
      : `A well-positioned property in ${cityName}, ${countryName}, offering `;
  return `${intro}${features.join(", ")}. ${faker.lorem.sentence(16)} ${faker.lorem.sentence(12)}`;
}

async function seedGeography() {
  const countryMap = new Map<string, string>();
  const cityMap = new Map<string, { id: string; name: string; lat: number; lng: number }[]>();

  for (const c of LAUNCH_COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        name: c.name,
        currencyCode: c.currencyCode,
        currencySymbol: c.currencySymbol,
        phoneCode: c.phoneCode,
        flagEmoji: c.flagEmoji,
      },
    });
    countryMap.set(c.code, country.id);

    const cities = [];
    for (const city of c.cities) {
      const row = await prisma.city.upsert({
        where: { countryId_name: { countryId: country.id, name: city.name } },
        update: {},
        create: { countryId: country.id, name: city.name, lat: city.lat, lng: city.lng },
      });
      cities.push({ id: row.id, name: row.name, lat: city.lat, lng: city.lng });
    }
    cityMap.set(c.code, cities);
  }

  return { countryMap, cityMap };
}

interface Lister {
  id: string;
  role: "OWNER" | "AGENT" | "COMPANY";
  companyId: string | null;
  countryCode: string;
}

async function seedPeopleAndCompanies(countryMap: Map<string, string>) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@veyora.dev" },
    update: {},
    create: {
      email: "admin@veyora.dev",
      name: "VEYORA Admin",
      passwordHash,
      role: "ADMIN",
      verificationStatus: "VERIFIED",
      avatarUrl: avatar("nyumba-admin"),
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@veyora.dev" },
    update: {},
    create: {
      email: "demo@veyora.dev",
      name: "Demo Buyer",
      passwordHash,
      role: "USER",
      countryId: countryMap.get("RW"),
      avatarUrl: avatar("demo-buyer"),
    },
  });

  const COMPANY_BLUEPRINTS: { name: string; countryCode: string; agents: number }[] = [
    { name: "Kigali Prime Properties", countryCode: "RW", agents: 3 },
    { name: "Lagos Skyline Realty", countryCode: "NG", agents: 4 },
    { name: "Accra Coastal Homes", countryCode: "GH", agents: 2 },
    { name: "Nairobi Urban Living", countryCode: "KE", agents: 3 },
    { name: "Cape Vista Estates", countryCode: "ZA", agents: 3 },
  ];

  const listers: Lister[] = [];
  const agentIds: string[] = [];
  const companyIds: string[] = [];

  for (const blueprint of COMPANY_BLUEPRINTS) {
    const slugBase = blueprint.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const ownerEmail = `owner@${slugBase}.dev`;
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        email: ownerEmail,
        name: faker.person.fullName(),
        passwordHash,
        role: "COMPANY",
        countryId: countryMap.get(blueprint.countryCode),
        verificationStatus: "VERIFIED",
        avatarUrl: avatar(ownerEmail),
      },
    });

    const company = await prisma.company.upsert({
      where: { slug: slugBase },
      update: {},
      create: {
        ownerId: owner.id,
        name: blueprint.name,
        slug: slugBase,
        logoUrl: picsum(`${slugBase}-logo`, 200, 200),
        coverImageUrl: picsum(`${slugBase}-cover`, 1600, 500),
        description: `${blueprint.name} is a verified real-estate agency connecting buyers, renters, and developers across ${LAUNCH_COUNTRIES.find((c) => c.code === blueprint.countryCode)?.name}.`,
        website: `https://${slugBase}.example`,
        phone: faker.phone.number(),
        email: `hello@${slugBase}.example`,
        verificationStatus: "VERIFIED",
      },
    });
    companyIds.push(company.id);
    listers.push({ id: owner.id, role: "COMPANY", companyId: company.id, countryCode: blueprint.countryCode });

    for (let i = 0; i < blueprint.agents; i++) {
      const agentEmail = `agent${i + 1}@${slugBase}.dev`;
      const agent = await prisma.user.upsert({
        where: { email: agentEmail },
        update: {},
        create: {
          email: agentEmail,
          name: faker.person.fullName(),
          passwordHash,
          role: "AGENT",
          companyId: company.id,
          countryId: countryMap.get(blueprint.countryCode),
          bio: "Helping clients find their next home or investment with a human, no-pressure approach.",
          whatsapp: faker.phone.number(),
          verificationStatus: "VERIFIED",
          avatarUrl: avatar(agentEmail),
        },
      });
      listers.push({ id: agent.id, role: "AGENT", companyId: company.id, countryCode: blueprint.countryCode });
      agentIds.push(agent.id);
    }
  }

  // Independent agents & owners covering the remaining launch countries.
  const REMAINING = ["UG", "TZ", "ET", "CM", "SN", "CI"];
  for (const code of REMAINING) {
    const agentEmail = `agent@${code.toLowerCase()}.veyora.dev`;
    const agent = await prisma.user.upsert({
      where: { email: agentEmail },
      update: {},
      create: {
        email: agentEmail,
        name: faker.person.fullName(),
        passwordHash,
        role: "AGENT",
        countryId: countryMap.get(code),
        bio: "Independent real-estate agent specializing in residential and short-stay listings.",
        whatsapp: faker.phone.number(),
        verificationStatus: Math.random() > 0.3 ? "VERIFIED" : "PENDING",
        avatarUrl: avatar(agentEmail),
      },
    });
    listers.push({ id: agent.id, role: "AGENT", companyId: null, countryCode: code });
    agentIds.push(agent.id);

    const ownerEmail = `owner@${code.toLowerCase()}.veyora.dev`;
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        email: ownerEmail,
        name: faker.person.fullName(),
        passwordHash,
        role: "OWNER",
        countryId: countryMap.get(code),
        verificationStatus: Math.random() > 0.5 ? "VERIFIED" : "UNVERIFIED",
        avatarUrl: avatar(ownerEmail),
      },
    });
    listers.push({ id: owner.id, role: "OWNER", companyId: null, countryCode: code });
  }

  // A handful of plain buyer/renter users for favorites, reviews & messages.
  const buyerIds: string[] = [demoUser.id];
  for (let i = 0; i < 9; i++) {
    const email = `buyer${i + 1}@veyora.dev`;
    const buyer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: faker.person.fullName(),
        passwordHash,
        role: "USER",
        countryId: countryMap.get(pick(LAUNCH_COUNTRIES).code),
        avatarUrl: avatar(email),
      },
    });
    buyerIds.push(buyer.id);
  }

  return { admin, demoUser, listers, agentIds, companyIds, buyerIds };
}

async function seedProperties(
  listers: Lister[],
  cityMap: Map<string, { id: string; name: string; lat: number; lng: number }[]>,
  countryMap: Map<string, string>
) {
  const propertyIds: { id: string; category: PropertyCategory; countryCode: string }[] = [];
  const liveCandidateIds: string[] = [];

  for (const lister of listers) {
    const cities = cityMap.get(lister.countryCode)!;
    const country = LAUNCH_COUNTRIES.find((c) => c.code === lister.countryCode)!;
    const countPerLister = lister.role === "COMPANY" ? 0 : lister.role === "AGENT" ? randInt(3, 6) : randInt(1, 3);

    for (let i = 0; i < countPerLister; i++) {
      const category = pick<PropertyCategory>(["RESIDENTIAL", "RESIDENTIAL", "RESIDENTIAL", "COMMERCIAL", "LAND", "SHORT_STAY"]);
      const listingType: ListingType =
        category === "LAND" ? "SALE" : category === "SHORT_STAY" ? "SHORT_STAY" : pick(["SALE", "RENT", "SALE", "RENT"]);
      const typeOptions = PROPERTY_TYPES_BY_CATEGORY[category];
      const type = pick(typeOptions).value as PropertyType;
      const city = pick(cities);

      const isResidential = category === "RESIDENTIAL" || category === "SHORT_STAY";
      const isHotelRoom = type === "HOTEL_ROOM";
      const bedrooms = isResidential && !isHotelRoom ? randInt(1, 6) : undefined;
      const bathrooms = isHotelRoom
        ? 1
        : isResidential
        ? Math.max(1, bedrooms! - randInt(0, 2))
        : category === "COMMERCIAL"
        ? randInt(1, 4)
        : undefined;
      const sizeSqm = category === "LAND" ? undefined : isHotelRoom ? randInt(18, 45) : randInt(45, 650);
      const landSizeSqm = category === "LAND" ? randInt(200, 20000) : Math.random() > 0.6 ? randInt(150, 2000) : undefined;

      const usdBase =
        category === "LAND"
          ? randInt(8, 150) * 1000
          : listingType === "RENT"
          ? randInt(200, 3500)
          : listingType === "SHORT_STAY"
          ? randInt(25, 300)
          : category === "COMMERCIAL"
          ? randInt(50, 600) * 1000
          : randInt(35, 450) * 1000;

      const price = localPrice(usdBase, country.currencyCode);
      const priceNote = listingType === "RENT" ? "/ month" : listingType === "SHORT_STAY" ? "/ night" : undefined;

      const adjective = Math.random() > 0.4 ? `${pick(ADJECTIVES)} ` : "";
      const title =
        category === "LAND"
          ? `${adjective}${TYPE_LABEL[type]} in ${city.name}`
          : bedrooms
          ? `${adjective}${bedrooms}-Bedroom ${TYPE_LABEL[type]} in ${city.name}`
          : `${adjective}${TYPE_LABEL[type]} in ${city.name}`;

      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 8)}`;

      const status = pick(["PUBLISHED", "PUBLISHED", "PUBLISHED", "PUBLISHED", "PENDING_REVIEW", "SOLD", "DRAFT"] as const);
      const verificationStatus = pick(["VERIFIED", "VERIFIED", "PENDING", "UNVERIFIED"] as const);
      const isFeatured = Math.random() > 0.85;

      const property = await prisma.property.create({
        data: {
          slug,
          title,
          description: description(category, city.name, country.name, bedrooms),
          category,
          type,
          listingType,
          status,
          price,
          currencyCode: country.currencyCode,
          priceNote,
          countryId: countryMap.get(lister.countryCode)!,
          cityId: city.id,
          district: faker.location.street(),
          address: `${faker.location.buildingNumber()} ${faker.location.street()}, ${city.name}`,
          lat: city.lat + (Math.random() - 0.5) * 0.08,
          lng: city.lng + (Math.random() - 0.5) * 0.08,
          bedrooms,
          bathrooms,
          parkingSpaces: category !== "LAND" ? randInt(0, 4) : undefined,
          sizeSqm,
          landSizeSqm,
          yearBuilt: category !== "LAND" ? randInt(1998, 2025) : undefined,
          furnished: isHotelRoom ? "FURNISHED" : isResidential ? pick(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const) : undefined,
          amenities: pickN(AMENITIES, randInt(3, 8)),
          ownerId: lister.id,
          companyId: lister.companyId,
          verificationStatus,
          isFeatured,
          publishedAt: status === "PUBLISHED" || status === "SOLD" ? faker.date.recent({ days: 60 }) : null,
          viewCount: randInt(5, 4200),
          likeCount: 0,
        },
      });

      // --- Media ---
      const photoCount = randInt(4, 8);
      const photoIds = propertyPhotoIds(category, photoCount);
      const mediaRows = photoIds.map((photoId, idx) => ({
        propertyId: property.id,
        type: "IMAGE" as const,
        url: unsplash(photoId),
        thumbnailUrl: unsplash(photoId, 480, 320),
        order: idx,
        isPrimary: idx === 0,
      }));
      await prisma.propertyMedia.createMany({ data: mediaRows });

      if (Math.random() < 0.45) {
        await prisma.propertyMedia.create({
          data: {
            propertyId: property.id,
            type: "VIDEO",
            url: pick(SAMPLE_VIDEOS),
            thumbnailUrl: unsplash(photoIds[0], 480, 854),
            order: photoCount,
            caption: "Walkthrough",
          },
        });
      }

      if (Math.random() < 0.35) {
        await prisma.propertyMedia.create({
          data: {
            propertyId: property.id,
            type: "MODEL_3D",
            url: "",
            order: photoCount + 1,
            meta: { procedural: true, style: pick(PROCEDURAL_STYLES), accent: pick(ACCENTS), bedrooms: bedrooms ?? 0 },
            caption: "3D Tour",
          },
        });
      }
      if (Math.random() < 0.25) {
        await prisma.propertyMedia.create({
          data: {
            propertyId: property.id,
            type: "IMAGE_360",
            url: "",
            order: photoCount + 2,
            meta: { procedural: true, style: pick(PROCEDURAL_STYLES), accent: pick(ACCENTS) },
            caption: "360° Panorama",
          },
        });
      }

      // Backfill PropertyView rows over the last 14 days so the dashboard's
      // "views over time" chart (which reads real view events, not the
      // denormalized counter) has something to plot on a fresh install.
      if (status === "PUBLISHED") {
        await prisma.propertyView.createMany({
          data: Array.from({ length: randInt(3, 14) }).map(() => ({
            propertyId: property.id,
            source: pick(["listing", "map", "search", "detail", "video_feed"]),
            createdAt: new Date(Date.now() - randInt(0, 13) * 86_400_000 - randInt(0, 86_400_000)),
          })),
        });
      }

      propertyIds.push({ id: property.id, category, countryCode: lister.countryCode });
      if (status === "PUBLISHED" && (category === "RESIDENTIAL" || category === "SHORT_STAY")) {
        liveCandidateIds.push(property.id);
      }
    }
  }

  // Guarantee a healthy Live page during demos instead of leaving it to
  // chance — pick a fixed slate rather than a low-probability per-item roll.
  const shuffledCandidates = pickN(liveCandidateIds, Math.min(8, liveCandidateIds.length));

  return { propertyIds, liveCandidateIds: shuffledCandidates };
}

async function seedSocial(buyerIds: string[], propertyIds: { id: string }[], agentIds: string[], companyIds: string[]) {
  const publishedSample = pickN(propertyIds, Math.min(40, propertyIds.length));
  for (const buyerId of buyerIds) {
    const favorites = pickN(publishedSample, randInt(2, 6));
    for (const property of favorites) {
      await prisma.favorite
        .create({ data: { userId: buyerId, propertyId: property.id } })
        .then(() => prisma.property.update({ where: { id: property.id }, data: { likeCount: { increment: 1 } } }))
        .catch(() => undefined);
    }
    if (Math.random() > 0.5) {
      await prisma.agentFollow
        .create({ data: { followerId: buyerId, agentId: pick(agentIds) } })
        .catch(() => undefined);
    }
    if (Math.random() > 0.6) {
      await prisma.companyFollow
        .create({ data: { followerId: buyerId, companyId: pick(companyIds) } })
        .catch(() => undefined);
    }
  }

  for (const property of pickN(publishedSample, 15)) {
    await prisma.review.create({
      data: {
        authorId: pick(buyerIds),
        propertyId: property.id,
        rating: randInt(3, 5),
        comment: faker.lorem.sentence(14),
      },
    });
  }
  for (const agentId of agentIds.slice(0, 8)) {
    await prisma.review.create({
      data: { authorId: pick(buyerIds), agentId, rating: randInt(4, 5), comment: faker.lorem.sentence(12) },
    });
  }

  await prisma.savedSearch.create({
    data: {
      userId: buyerIds[0],
      name: "Kigali apartments under $1,000",
      filters: { cityName: "Kigali", type: "APARTMENT", listingType: "RENT", maxPrice: 1000 },
    },
  });
}

async function seedConversation(buyerId: string, agentId: string, propertyId: string) {
  const conversation = await prisma.conversation.create({
    data: {
      propertyId,
      lastMessageAt: new Date(),
      participants: { create: [{ userId: buyerId }, { userId: agentId }] },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, senderId: buyerId, text: "Hi! Is this property still available?" },
      { conversationId: conversation.id, senderId: agentId, text: "Yes it is! Would you like to schedule a viewing?" },
      { conversationId: conversation.id, senderId: buyerId, text: "Yes, this weekend works for me." },
    ],
  });
}

async function seedLiveStreams(liveCandidateIds: string[], listers: Lister[]) {
  for (const propertyId of liveCandidateIds.slice(0, 4)) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) continue;
    const stream = await prisma.liveStream.create({
      data: {
        propertyId,
        hostId: property.ownerId,
        title: `Live walkthrough: ${property.title}`,
        status: "LIVE",
        startedAt: new Date(Date.now() - randInt(2, 40) * 60_000),
        currentViewers: randInt(8, 340),
        peakViewers: randInt(340, 900),
        streamKey: `demo_${propertyId}`,
      },
    });
    await prisma.liveChatMessage.createMany({
      data: [
        { liveStreamId: stream.id, userId: property.ownerId, text: "Welcome everyone! Feel free to ask questions 👋" },
      ],
    });
  }

  // A couple of scheduled upcoming tours for the Live page's "upcoming" rail.
  const scheduledCandidates = pickN(liveCandidateIds.slice(4), Math.min(3, Math.max(0, liveCandidateIds.length - 4)));
  for (const propertyId of scheduledCandidates) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) continue;
    await prisma.liveStream.create({
      data: {
        propertyId,
        hostId: property.ownerId,
        title: `Upcoming live tour: ${property.title}`,
        status: "SCHEDULED",
        scheduledFor: faker.date.soon({ days: 5 }),
      },
    });
  }
}

async function main() {
  const existing = await prisma.property.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} properties — skipping seed. Run "prisma migrate reset" to start fresh.`);
    return;
  }

  console.log("Seeding countries & cities...");
  const { countryMap, cityMap } = await seedGeography();

  console.log("Seeding users, agents & companies...");
  const { listers, agentIds, companyIds, buyerIds } = await seedPeopleAndCompanies(countryMap);

  console.log("Seeding properties & media...");
  const { propertyIds, liveCandidateIds } = await seedProperties(listers, cityMap, countryMap);

  console.log("Seeding favorites, follows & reviews...");
  await seedSocial(buyerIds, propertyIds, agentIds, companyIds);

  console.log("Seeding a sample conversation...");
  const firstPublished = propertyIds[0];
  if (firstPublished) await seedConversation(buyerIds[0], agentIds[0], firstPublished.id);

  console.log("Seeding live streams...");
  await seedLiveStreams(liveCandidateIds, listers);

  console.log(`
Done. Seeded ${propertyIds.length} properties across ${LAUNCH_COUNTRIES.length} countries.

Demo accounts (password: ${DEMO_PASSWORD}):
  Admin        admin@veyora.dev
  Buyer/User   demo@veyora.dev
  Company      owner@kigali-prime-properties.dev
  Agent        agent1@kigali-prime-properties.dev
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

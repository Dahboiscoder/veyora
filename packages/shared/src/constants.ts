export const ROLES = ["USER", "OWNER", "AGENT", "COMPANY", "ADMIN"] as const;
export type RoleName = (typeof ROLES)[number];

// Roles allowed to create/manage property listings.
export const CAN_LIST_ROLES: RoleName[] = ["OWNER", "AGENT", "COMPANY", "ADMIN"];

export interface CountrySeed {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  phoneCode: string;
  flagEmoji: string;
  cities: { name: string; lat: number; lng: number }[];
}

// Africa-first: launch markets. Adding a new country/city is a matter of
// appending to this list + re-running the DB seed — no code changes needed
// elsewhere, since countries/cities are DB rows, not hard-coded enums.
export const LAUNCH_COUNTRIES: CountrySeed[] = [
  {
    code: "RW",
    name: "Rwanda",
    currencyCode: "RWF",
    currencySymbol: "FRw",
    phoneCode: "+250",
    flagEmoji: "🇷🇼",
    cities: [
      { name: "Kigali", lat: -1.9441, lng: 30.0619 },
      { name: "Musanze", lat: -1.4998, lng: 29.6333 },
      { name: "Rubavu", lat: -1.6792, lng: 29.2667 },
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    currencyCode: "NGN",
    currencySymbol: "₦",
    phoneCode: "+234",
    flagEmoji: "🇳🇬",
    cities: [
      { name: "Lagos", lat: 6.5244, lng: 3.3792 },
      { name: "Abuja", lat: 9.0765, lng: 7.3986 },
      { name: "Port Harcourt", lat: 4.8156, lng: 7.0498 },
    ],
  },
  {
    code: "GH",
    name: "Ghana",
    currencyCode: "GHS",
    currencySymbol: "₵",
    phoneCode: "+233",
    flagEmoji: "🇬🇭",
    cities: [
      { name: "Accra", lat: 5.6037, lng: -0.187 },
      { name: "Kumasi", lat: 6.6885, lng: -1.6244 },
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    currencyCode: "KES",
    currencySymbol: "KSh",
    phoneCode: "+254",
    flagEmoji: "🇰🇪",
    cities: [
      { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
      { name: "Mombasa", lat: -4.0435, lng: 39.6682 },
    ],
  },
  {
    code: "ZA",
    name: "South Africa",
    currencyCode: "ZAR",
    currencySymbol: "R",
    phoneCode: "+27",
    flagEmoji: "🇿🇦",
    cities: [
      { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
      { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
      { name: "Durban", lat: -29.8587, lng: 31.0218 },
    ],
  },
  {
    code: "UG",
    name: "Uganda",
    currencyCode: "UGX",
    currencySymbol: "USh",
    phoneCode: "+256",
    flagEmoji: "🇺🇬",
    cities: [
      { name: "Kampala", lat: 0.3476, lng: 32.5825 },
      { name: "Entebbe", lat: 0.0512, lng: 32.4637 },
    ],
  },
  {
    code: "TZ",
    name: "Tanzania",
    currencyCode: "TZS",
    currencySymbol: "TSh",
    phoneCode: "+255",
    flagEmoji: "🇹🇿",
    cities: [
      { name: "Dar es Salaam", lat: -6.7924, lng: 39.2083 },
      { name: "Arusha", lat: -3.3869, lng: 36.683 },
    ],
  },
  {
    code: "ET",
    name: "Ethiopia",
    currencyCode: "ETB",
    currencySymbol: "Br",
    phoneCode: "+251",
    flagEmoji: "🇪🇹",
    cities: [{ name: "Addis Ababa", lat: 9.03, lng: 38.74 }],
  },
  {
    code: "CM",
    name: "Cameroon",
    currencyCode: "XAF",
    currencySymbol: "FCFA",
    phoneCode: "+237",
    flagEmoji: "🇨🇲",
    cities: [
      { name: "Douala", lat: 4.0511, lng: 9.7679 },
      { name: "Yaoundé", lat: 3.848, lng: 11.5021 },
    ],
  },
  {
    code: "SN",
    name: "Senegal",
    currencyCode: "XOF",
    currencySymbol: "CFA",
    phoneCode: "+221",
    flagEmoji: "🇸🇳",
    cities: [{ name: "Dakar", lat: 14.7167, lng: -17.4677 }],
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    currencyCode: "XOF",
    currencySymbol: "CFA",
    phoneCode: "+225",
    flagEmoji: "🇨🇮",
    cities: [{ name: "Abidjan", lat: 5.36, lng: -4.0083 }],
  },
];

export const PROPERTY_CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "LAND", "SHORT_STAY"] as const;

export const PROPERTY_TYPES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  RESIDENTIAL: [
    { value: "HOUSE", label: "House" },
    { value: "APARTMENT", label: "Apartment" },
    { value: "VILLA", label: "Villa" },
    { value: "DUPLEX", label: "Duplex" },
    { value: "CONDO", label: "Condo" },
    { value: "TOWNHOUSE", label: "Townhouse" },
  ],
  COMMERCIAL: [
    { value: "OFFICE", label: "Office" },
    { value: "SHOP", label: "Shop" },
    { value: "WAREHOUSE", label: "Warehouse" },
    { value: "HOTEL", label: "Hotel" },
    { value: "RESTAURANT", label: "Restaurant" },
    { value: "COMMERCIAL_BUILDING", label: "Commercial Building" },
  ],
  LAND: [
    { value: "RESIDENTIAL_LAND", label: "Residential Land" },
    { value: "COMMERCIAL_LAND", label: "Commercial Land" },
    { value: "AGRICULTURAL_LAND", label: "Agricultural Land" },
  ],
  SHORT_STAY: [
    { value: "APARTMENT", label: "Apartment" },
    { value: "HOTEL_ROOM", label: "Hotel Room" },
  ],
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(PROPERTY_TYPES_BY_CATEGORY)
    .flat()
    .map((t) => [t.value, t.label])
);

export const LISTING_TYPE_LABELS: Record<string, string> = {
  SALE: "For Sale",
  RENT: "For Rent",
  SHORT_STAY: "Short Stay",
};

export const LISTING_TYPES = ["SALE", "RENT", "SHORT_STAY"] as const;

export const FURNISHED_STATUSES = ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const;

export const AMENITIES = [
  "Swimming Pool",
  "Backup Generator",
  "Borehole / Water Tank",
  "Solar Power",
  "24/7 Security",
  "CCTV",
  "Gated Community",
  "Air Conditioning",
  "Fibre Internet",
  "Elevator",
  "Gym",
  "Balcony",
  "Garden",
  "Rooftop Terrace",
  "Servant Quarters",
  "Ensuite Bedrooms",
  "Walk-in Closet",
  "Smart Home System",
  "EV Charging",
  "Pet Friendly",
  "Furnished Kitchen",
  "Parking Garage",
  "Playground",
  "Co-working Space",
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Lowest Price" },
  { value: "price_desc", label: "Highest Price" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "most_liked", label: "Most Liked" },
] as const;

export const MEDIA_TYPES = [
  "IMAGE",
  "VIDEO",
  "IMAGE_360",
  "VIDEO_360",
  "MODEL_3D",
  "FLOOR_PLAN",
  "DOCUMENT",
] as const;

// Accepts a Prisma Decimal too (duck-typed via toString(), so this package
// doesn't need a dependency on @prisma/client) — server components call
// formatPrice on raw query results before any JSON serialization happens.
export function formatPrice(
  amount: number | string | { toString(): string },
  currencyCode: string,
  priceNote?: string | null
): string {
  const num = typeof amount === "number" ? amount : Number(amount.toString());
  const country = LAUNCH_COUNTRIES.find((c) => c.currencyCode === currencyCode);
  const symbol = country?.currencySymbol ?? currencyCode;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
  return `${symbol} ${formatted}${priceNote ? ` ${priceNote}` : ""}`;
}

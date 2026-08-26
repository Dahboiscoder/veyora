export interface PropertyCardMedia {
  id: string;
  type: "IMAGE" | "VIDEO" | "IMAGE_360" | "VIDEO_360" | "MODEL_3D" | "FLOOR_PLAN" | "DOCUMENT";
  url: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  order: number;
}

export interface PropertyCardData {
  id: string;
  slug: string;
  title: string;
  category: "RESIDENTIAL" | "COMMERCIAL" | "LAND" | "SHORT_STAY";
  type: string;
  listingType: "SALE" | "RENT" | "SHORT_STAY";
  status: string;
  price: string | number;
  currencyCode: string;
  priceNote: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  publishedAt: string | null;
  city: { id: string; name: string };
  country: { code: string; name: string; flagEmoji: string | null; currencySymbol: string };
  owner: { id: string; name: string; avatarUrl: string | null; role: string; verificationStatus: string };
  company: { id: string; name: string; slug: string; logoUrl: string | null } | null;
  media: PropertyCardMedia[];
  liveStreams: { id: string; currentViewers: number }[];
  _count: { favorites: number };
  isFavorited?: boolean;
}

export interface AppliedSearchFilters {
  category?: string;
  type?: string;
  listingType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  countryCode?: string;
  cityName?: string;
  _cityName?: string;
  verifiedOnly?: boolean;
  has3DTour?: boolean;
  hasVideo?: boolean;
  isLive?: boolean;
}

export interface PropertySearchResponse {
  items: PropertyCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  appliedFilters?: AppliedSearchFilters;
}

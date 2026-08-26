import { z } from "zod";

export const roleSchema = z.enum(["USER", "OWNER", "AGENT", "COMPANY", "ADMIN"]);

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["USER", "OWNER", "AGENT", "COMPANY"]).default("USER"),
  phone: z.string().min(6).max(20).optional(),
  countryCode: z.string().length(2).optional(),
  companyName: z.string().min(2).max(120).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const propertyCategorySchema = z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND", "SHORT_STAY"]);
export const listingTypeSchema = z.enum(["SALE", "RENT", "SHORT_STAY"]);
export const furnishedStatusSchema = z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]);

export const propertyCreateSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(20).max(8000),
  category: propertyCategorySchema,
  type: z.string().min(2),
  listingType: listingTypeSchema,
  price: z.number().positive(),
  currencyCode: z.string().length(3),
  priceNote: z.string().max(40).optional(),
  countryId: z.string(),
  cityId: z.string(),
  district: z.string().max(120).optional(),
  address: z.string().max(240).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  parkingSpaces: z.number().int().min(0).max(50).optional(),
  sizeSqm: z.number().positive().optional(),
  landSizeSqm: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1900).max(2100).optional(),
  furnished: furnishedStatusSchema.optional(),
  amenities: z.array(z.string()).max(30).default([]),
});
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;

export const propertyUpdateSchema = propertyCreateSchema.partial();
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

export const propertyMediaCreateSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "IMAGE_360", "VIDEO_360", "MODEL_3D", "FLOOR_PLAN", "DOCUMENT"]),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  order: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  caption: z.string().max(200).optional(),
  meta: z.record(z.any()).optional(),
});
export type PropertyMediaCreateInput = z.infer<typeof propertyMediaCreateSchema>;

export const propertySearchSchema = z.object({
  q: z.string().max(200).optional(),
  category: propertyCategorySchema.optional(),
  type: z.string().optional(),
  listingType: listingTypeSchema.optional(),
  countryCode: z.string().length(2).optional(),
  cityId: z.string().optional(),
  cityName: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  currencyCode: z.string().length(3).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  furnished: furnishedStatusSchema.optional(),
  amenities: z.array(z.string()).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  has3DTour: z.coerce.boolean().optional(),
  hasVideo: z.coerce.boolean().optional(),
  isLive: z.coerce.boolean().optional(),
  bounds: z
    .object({ north: z.number(), south: z.number(), east: z.number(), west: z.number() })
    .optional(),
  sort: z
    .enum(["recommended", "newest", "price_asc", "price_desc", "most_viewed", "most_liked"])
    .default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;

export const messageSendSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  propertyId: z.string().optional(),
  text: z.string().min(1).max(4000).optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.string().max(40).optional(),
});
export type MessageSendInput = z.infer<typeof messageSendSchema>;

export const reviewCreateSchema = z.object({
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
  companyId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;

export const viewingRequestSchema = z.object({
  propertyId: z.string(),
  proposedAt: z.coerce.date(),
  message: z.string().max(500).optional(),
});
export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;

export const reportCreateSchema = z.object({
  propertyId: z.string().optional(),
  targetUserId: z.string().optional(),
  reason: z.enum(["FRAUD", "DUPLICATE", "MISLEADING", "SOLD_ALREADY", "OFFENSIVE", "WRONG_INFO", "OTHER"]),
  details: z.string().max(2000).optional(),
});
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;

export const liveStreamCreateSchema = z.object({
  propertyId: z.string(),
  title: z.string().min(3).max(160),
  scheduledFor: z.coerce.date().optional(),
});
export type LiveStreamCreateInput = z.infer<typeof liveStreamCreateSchema>;

export const savedSearchCreateSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.record(z.any()),
  notifyOnNew: z.boolean().default(true),
});
export type SavedSearchCreateInput = z.infer<typeof savedSearchCreateSchema>;

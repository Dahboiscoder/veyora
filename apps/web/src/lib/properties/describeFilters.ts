import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS, LAUNCH_COUNTRIES } from "@nyumba/shared";
import type { AppliedSearchFilters } from "@/types/property";

/** Turns the server's parsed-from-natural-language filters back into short
 * human-readable chips, so a search like "3 bedroom apartment in Kigali
 * under $1,000" visibly shows what was understood, not just a result count. */
export function describeAppliedFilters(filters: AppliedSearchFilters | undefined): string[] {
  if (!filters) return [];
  const chips: string[] = [];

  if (filters.bedrooms !== undefined) chips.push(`${filters.bedrooms}+ bed`);
  if (filters.bathrooms !== undefined) chips.push(`${filters.bathrooms}+ bath`);
  if (filters.type && PROPERTY_TYPE_LABELS[filters.type]) chips.push(PROPERTY_TYPE_LABELS[filters.type]);
  if (filters.listingType && LISTING_TYPE_LABELS[filters.listingType]) chips.push(LISTING_TYPE_LABELS[filters.listingType]);

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const symbol = LAUNCH_COUNTRIES.find((c) => c.currencyCode === filters.currencyCode)?.currencySymbol ?? "";
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      chips.push(`${symbol}${filters.minPrice}–${symbol}${filters.maxPrice}`);
    } else if (filters.maxPrice !== undefined) {
      chips.push(`Under ${symbol}${filters.maxPrice}`);
    } else {
      chips.push(`Over ${symbol}${filters.minPrice}`);
    }
  }

  const cityName = filters.cityName ?? filters._cityName;
  const countryName = LAUNCH_COUNTRIES.find((c) => c.code === filters.countryCode)?.name;
  if (cityName && countryName) chips.push(`${cityName}, ${countryName}`);
  else if (cityName) chips.push(cityName);
  else if (countryName) chips.push(countryName);

  if (filters.verifiedOnly) chips.push("Verified only");
  if (filters.has3DTour) chips.push("3D tour");
  if (filters.hasVideo) chips.push("Video");
  if (filters.isLive) chips.push("Live now");

  return chips;
}

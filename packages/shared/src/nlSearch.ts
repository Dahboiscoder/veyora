import { LAUNCH_COUNTRIES, PROPERTY_TYPES_BY_CATEGORY } from "./constants";

export interface ParsedSearchQuery {
  cityName?: string;
  countryCode?: string;
  category?: string;
  type?: string;
  listingType?: "SALE" | "RENT" | "SHORT_STAY";
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  furnished?: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";
  verifiedOnly?: boolean;
  has3DTour?: boolean;
  hasVideo?: boolean;
  isLive?: boolean;
  remainder: string;
}

const CITY_INDEX = LAUNCH_COUNTRIES.flatMap((country) =>
  country.cities.map((city) => ({ name: city.name, countryCode: country.code }))
);

/**
 * Lightweight keyword/regex parser for free-text search bars, e.g.
 * "3 bedroom apartment in Kigali under $1,000". Deliberately not an LLM
 * call — this runs synchronously on every keystroke-debounced query, so it
 * needs to be instant and free. Falls back gracefully: anything it can't
 * confidently parse stays in `remainder` and is used as a plain text filter.
 */
export function parseSearchQuery(raw: string): ParsedSearchQuery {
  let text = ` ${raw.trim()} `;
  const result: ParsedSearchQuery = { remainder: "" };

  const consume = (pattern: RegExp, handler: (match: RegExpMatchArray) => void) => {
    const match = text.match(pattern);
    if (match) {
      handler(match);
      text = text.replace(match[0], " ");
    }
  };

  consume(/\b(\d+)\s*(?:bed(?:room)?s?|br)\b/i, (m) => (result.bedrooms = parseInt(m[1], 10)));
  consume(/\b(\d+)\s*(?:bath(?:room)?s?|ba)\b/i, (m) => (result.bathrooms = parseInt(m[1], 10)));

  consume(/\b(?:under|below|less than|max(?:imum)?)\s*\$?\s*([\d,]+)k?\b/i, (m) => {
    const raw = m[1].replace(/,/g, "");
    result.maxPrice = m[0].toLowerCase().includes("k") ? Number(raw) * 1000 : Number(raw);
  });
  consume(/\b(?:over|above|more than|min(?:imum)?)\s*\$?\s*([\d,]+)k?\b/i, (m) => {
    const raw = m[1].replace(/,/g, "");
    result.minPrice = m[0].toLowerCase().includes("k") ? Number(raw) * 1000 : Number(raw);
  });

  consume(/\bfor\s+rent\b|\bto\s+rent\b|\brental\b|\brent(?:ing)?\b/i, () => (result.listingType = "RENT"));
  consume(/\bfor\s+sale\b|\bto\s+buy\b|\bbuy(?:ing)?\b|\bpurchase\b/i, () => (result.listingType = "SALE"));
  consume(/\bshort\s*stay\b|\bairbnb\b|\bvacation\b|\bholiday\s+let\b/i, () => (result.listingType = "SHORT_STAY"));

  consume(/\bfurnished\b/i, () => (result.furnished = "FURNISHED"));
  consume(/\bsemi[\s-]?furnished\b/i, () => (result.furnished = "SEMI_FURNISHED"));
  consume(/\bunfurnished\b/i, () => (result.furnished = "UNFURNISHED"));

  consume(/\bverified\b/i, () => (result.verifiedOnly = true));
  consume(/\b3d\s*tour\b|\bvirtual\s*tour\b|\b360\b/i, () => (result.has3DTour = true));
  consume(/\bvideo\b/i, () => (result.hasVideo = true));
  consume(/\blive\s*(now|tour)?\b/i, () => (result.isLive = true));

  for (const [category, types] of Object.entries(PROPERTY_TYPES_BY_CATEGORY)) {
    for (const t of types) {
      const re = new RegExp(`\\b${t.label.replace(/\s+/g, "\\s+")}s?\\b`, "i");
      if (re.test(text)) {
        result.type = t.value;
        result.category = category;
        text = text.replace(re, " ");
        break;
      }
    }
    if (result.type) break;
  }
  if (!result.category) {
    consume(/\bland\b/i, () => (result.category = "LAND"));
    consume(/\bcommercial\b/i, () => (result.category = result.category ?? "COMMERCIAL"));
  }

  consume(/\bin\s+([a-zA-Zà-ÿ\s']+?)(?=$|,|\.|under|below|over|above|for|with)/i, (m) => {
    const candidate = m[1].trim();
    const found = CITY_INDEX.find((c) => c.name.toLowerCase() === candidate.toLowerCase());
    if (found) {
      result.cityName = found.name;
      result.countryCode = found.countryCode;
    } else {
      // Not a recognized city — put it back so it isn't silently dropped.
      text += ` ${candidate}`;
    }
  });
  if (!result.cityName) {
    for (const city of CITY_INDEX) {
      const re = new RegExp(`\\b${city.name}\\b`, "i");
      if (re.test(text)) {
        result.cityName = city.name;
        result.countryCode = city.countryCode;
        text = text.replace(re, " ");
        break;
      }
    }
  }

  result.remainder = text.replace(/\s+/g, " ").trim();
  return result;
}

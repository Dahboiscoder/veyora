/**
 * Prisma's Decimal fields (just `price` in this schema) aren't plain
 * objects, so React's server->client boundary refuses to serialize them.
 * Anywhere a Server Component hands Prisma-fetched property data straight
 * to a "use client" component (as opposed to via a JSON API response,
 * which already stringifies through Decimal's toJSON), run it through
 * this first.
 */
export function serializeProperty<T extends { price: unknown }>(property: T): T {
  const price = property.price as { toString(): string } | string | number;
  return { ...property, price: typeof price === "object" ? price.toString() : price };
}

export function serializeProperties<T extends { price: unknown }>(properties: T[]): T[] {
  return properties.map(serializeProperty);
}

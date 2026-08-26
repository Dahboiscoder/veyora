"use client";

import { useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl, GeolocateControl, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import Image from "next/image";
import { Bed, Maximize, X } from "lucide-react";
import { formatPrice } from "@nyumba/shared";
import { clientEnv } from "@/lib/env.client";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "@/types/property";

const LISTING_COLOR: Record<string, string> = {
  SALE: "#f96a1f",
  RENT: "#0cb4db",
  SHORT_STAY: "#a855f7",
};

function computeBounds(properties: PropertyCardData[]) {
  const withCoords = properties.filter((p) => p.lat && p.lng) as (PropertyCardData & { lat: number; lng: number })[];
  if (withCoords.length === 0) return null;
  const lats = withCoords.map((p) => p.lat);
  const lngs = withCoords.map((p) => p.lng);
  return {
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

export function PropertyMap({
  properties,
  className,
  height = "100%",
}: {
  properties: PropertyCardData[];
  className?: string;
  height?: string | number;
}) {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<PropertyCardData | null>(null);
  const bounds = useMemo(() => computeBounds(properties), [properties]);

  const initialViewState = bounds
    ? { longitude: bounds.longitude, latitude: bounds.latitude, zoom: properties.length === 1 ? 13 : 5.5 }
    : { longitude: 20, latitude: 2, zoom: 3 };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10", className)} style={{ height }}>
      <Map
        ref={mapRef}
        mapStyle={clientEnv.mapStyleUrl}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => {
          if (bounds && properties.length > 1) {
            mapRef.current?.fitBounds(
              [
                [bounds.minLng, bounds.minLat],
                [bounds.maxLng, bounds.maxLat],
              ],
              { padding: 60, duration: 0, maxZoom: 14 }
            );
          }
        }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" />

        {properties.map((property) => {
          if (!property.lat || !property.lng) return null;
          const isSelected = selected?.id === property.id;
          return (
            <Marker
              key={property.id}
              longitude={property.lng}
              latitude={property.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelected(property);
                mapRef.current?.flyTo({ center: [property.lng!, property.lat!], zoom: Math.max(mapRef.current.getZoom(), 12), duration: 600 });
              }}
            >
              <button
                className={cn(
                  "flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-bold text-white shadow-lg transition-all duration-300",
                  isSelected ? "scale-110" : "hover:scale-105"
                )}
                style={{
                  backgroundColor: LISTING_COLOR[property.listingType] ?? "#f96a1f",
                  borderColor: isSelected ? "white" : "transparent",
                }}
              >
                {formatPrice(property.price, property.currencyCode).split(".")[0]}
              </button>
            </Marker>
          );
        })}

        {selected && selected.lat && selected.lng && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            closeButton={false}
            offset={16}
            className="property-map-popup"
            onClose={() => setSelected(null)}
          >
            <Link
              href={`/property/${selected.slug}`}
              className="glass-card block w-64 overflow-hidden !bg-void-900 text-left"
            >
              <div className="relative h-32 w-full">
                {selected.media[0] && (
                  <Image src={selected.media[0].url} alt={selected.title} fill sizes="256px" className="object-cover" />
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelected(null);
                  }}
                  className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-3">
                <p className="font-display text-sm font-semibold text-white">
                  {formatPrice(selected.price, selected.currencyCode, selected.priceNote)}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{selected.title}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-white/50">
                  {selected.bedrooms !== null && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" /> {selected.bedrooms}
                    </span>
                  )}
                  {selected.sizeSqm !== null && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3 w-3" /> {selected.sizeSqm}m²
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  );
}

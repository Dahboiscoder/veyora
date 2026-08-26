"use client";

import { useState } from "react";
import { BadgeCheck, Box, Radio, Video, X } from "lucide-react";
import {
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES_BY_CATEGORY,
  FURNISHED_STATUSES,
  AMENITIES,
  LAUNCH_COUNTRIES,
} from "@nyumba/shared";
import type { SearchFilters } from "@/hooks/usePropertySearch";
import { cn } from "@/lib/utils";

const LISTING_TYPE_OPTIONS = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
  { value: "SHORT_STAY", label: "Short Stay" },
];

const FEATURE_TOGGLES: { key: keyof SearchFilters; label: string; icon: typeof BadgeCheck }[] = [
  { key: "verifiedOnly", label: "Verified only", icon: BadgeCheck },
  { key: "has3DTour", label: "3D Tour available", icon: Box },
  { key: "hasVideo", label: "Has video", icon: Video },
  { key: "isLive", label: "Live now", icon: Radio },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/10 py-5 first:pt-0 last:border-0">
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      {children}
    </div>
  );
}

function OptionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-ember-500/60 bg-ember-500/15 text-ember-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
      )}
    >
      {children}
    </button>
  );
}

export function FilterPanel({
  filters,
  setFilters,
  clearFilters,
  onClose,
}: {
  filters: SearchFilters;
  setFilters: (next: SearchFilters, opts?: { resetPage?: boolean }) => void;
  clearFilters: () => void;
  onClose?: () => void;
}) {
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? "");

  const country = LAUNCH_COUNTRIES.find((c) => c.code === filters.countryCode);
  const typeOptions = filters.category ? PROPERTY_TYPES_BY_CATEGORY[filters.category] : [];

  function commitPrice() {
    setFilters({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <h3 className="font-display text-lg font-semibold text-white">Filters</h3>
        <div className="flex items-center gap-3">
          <button onClick={clearFilters} className="text-xs font-medium text-white/50 hover:text-white">
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06] lg:hidden">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        <Section title="Listing type">
          <div className="flex flex-wrap gap-2">
            {LISTING_TYPE_OPTIONS.map((opt) => (
              <OptionChip
                key={opt.value}
                active={filters.listingType === opt.value}
                onClick={() => setFilters({ listingType: filters.listingType === opt.value ? undefined : opt.value })}
              >
                {opt.label}
              </OptionChip>
            ))}
          </div>
        </Section>

        <Section title="Category">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_CATEGORIES.map((cat) => (
              <OptionChip
                key={cat}
                active={filters.category === cat}
                onClick={() =>
                  setFilters({ category: filters.category === cat ? undefined : cat, type: undefined })
                }
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase().replace("_", " ")}
              </OptionChip>
            ))}
          </div>
        </Section>

        {typeOptions.length > 0 && (
          <Section title="Property type">
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((t) => (
                <OptionChip
                  key={t.value}
                  active={filters.type === t.value}
                  onClick={() => setFilters({ type: filters.type === t.value ? undefined : t.value })}
                >
                  {t.label}
                </OptionChip>
              ))}
            </div>
          </Section>
        )}

        <Section title="Price range">
          <div className="flex items-center gap-2">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => e.key === "Enter" && commitPrice()}
              placeholder="Min"
              inputMode="numeric"
              className="input"
            />
            <span className="text-white/30">–</span>
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => e.key === "Enter" && commitPrice()}
              placeholder="Max"
              inputMode="numeric"
              className="input"
            />
          </div>
        </Section>

        <Section title="Bedrooms & bathrooms">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs text-white/50">Bedrooms</p>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <OptionChip key={n} active={filters.bedrooms === n} onClick={() => setFilters({ bedrooms: filters.bedrooms === n ? undefined : n })}>
                    {n}+
                  </OptionChip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs text-white/50">Bathrooms</p>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <OptionChip key={n} active={filters.bathrooms === n} onClick={() => setFilters({ bathrooms: filters.bathrooms === n ? undefined : n })}>
                    {n}+
                  </OptionChip>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Furnished status">
          <div className="flex flex-wrap gap-2">
            {FURNISHED_STATUSES.map((f) => (
              <OptionChip key={f} active={filters.furnished === f} onClick={() => setFilters({ furnished: filters.furnished === f ? undefined : f })}>
                {f.charAt(0) + f.slice(1).toLowerCase().replace("_", "-")}
              </OptionChip>
            ))}
          </div>
        </Section>

        <Section title="Location">
          <select
            className="input mb-2"
            value={filters.countryCode ?? ""}
            onChange={(e) => setFilters({ countryCode: e.target.value || undefined, cityName: undefined })}
          >
            <option value="">All countries</option>
            {LAUNCH_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flagEmoji} {c.name}
              </option>
            ))}
          </select>
          {country && (
            <select className="input" value={filters.cityName ?? ""} onChange={(e) => setFilters({ cityName: e.target.value || undefined })}>
              <option value="">All cities in {country.name}</option>
              {country.cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          )}
        </Section>

        <Section title="Trust & features">
          <div className="flex flex-col gap-2">
            {FEATURE_TOGGLES.map((toggle) => (
              <label key={toggle.key} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-white/75">
                  <toggle.icon className="h-4 w-4 text-white/40" /> {toggle.label}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(filters[toggle.key])}
                  onChange={(e) => setFilters({ [toggle.key]: e.target.checked || undefined } as SearchFilters)}
                  className="h-4 w-4 accent-ember-500"
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITIES.slice(0, 12).map((amenity) => {
              const active = filters.amenities?.includes(amenity);
              return (
                <OptionChip
                  key={amenity}
                  active={!!active}
                  onClick={() => {
                    const current = filters.amenities ?? [];
                    const next = active ? current.filter((a) => a !== amenity) : [...current, amenity];
                    setFilters({ amenities: next.length ? next : undefined });
                  }}
                >
                  {amenity}
                </OptionChip>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

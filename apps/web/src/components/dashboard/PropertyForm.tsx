"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  propertyCreateSchema,
  type PropertyCreateInput,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES_BY_CATEGORY,
  FURNISHED_STATUSES,
  AMENITIES,
} from "@nyumba/shared";
import { useCountries } from "@/hooks/useCountries";
import { cn } from "@/lib/utils";

export type PropertyFormValues = PropertyCreateInput;

const LISTING_TYPES = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
  { value: "SHORT_STAY", label: "Short Stay" },
];

export function PropertyForm({
  defaultValues,
  onSubmit,
  submitLabel = "Continue",
  submitting,
}: {
  defaultValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => void;
  submitLabel?: string;
  submitting?: boolean;
}) {
  const { countries, isLoading: countriesLoading, isError: countriesError, refetch: refetchCountries } = useCountries();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyCreateSchema),
    defaultValues: { amenities: [], ...defaultValues },
  });

  const category = watch("category");
  const countryId = watch("countryId");
  const listingType = watch("listingType");
  const selectedAmenities = watch("amenities") ?? [];
  const country = countries.find((c) => c.id === countryId);
  const typeOptions = category ? PROPERTY_TYPES_BY_CATEGORY[category] : [];
  const isResidential = category === "RESIDENTIAL" || category === "SHORT_STAY";

  function toggleAmenity(amenity: string) {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setValue("amenities", next);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Basic information</h2>
        <div className="grid gap-4">
          <div>
            <label className="field-label">Title</label>
            <input {...register("title")} placeholder="Elegant 3-Bedroom Villa in Kigali" className="input" />
            {errors.title && <p className="field-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea {...register("description")} rows={5} className="input resize-none" placeholder="Describe the property, its features, and what makes it special…" />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Category</label>
              <select {...register("category")} className="input" defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                {PROPERTY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </select>
              {errors.category && <p className="field-error">{errors.category.message}</p>}
            </div>
            <div>
              <label className="field-label">Property type</label>
              <select {...register("type")} className="input" disabled={!category} defaultValue="">
                <option value="" disabled>
                  {category ? "Select type" : "Select category first"}
                </option>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="field-error">{errors.type.message}</p>}
            </div>
            <div>
              <label className="field-label">Listing type</label>
              <select {...register("listingType")} className="input" defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                {LISTING_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              {errors.listingType && <p className="field-error">{errors.listingType.message}</p>}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Country</label>
            <select
              {...register("countryId")}
              className="input"
              defaultValue=""
              disabled={countriesLoading || countriesError}
            >
              <option value="" disabled>
                {countriesLoading ? "Loading countries…" : countriesError ? "Couldn't load countries" : "Select country"}
              </option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flagEmoji} {c.name}
                </option>
              ))}
            </select>
            {errors.countryId && <p className="field-error">{errors.countryId.message}</p>}
            {countriesError && (
              <p className="field-error">
                Couldn't load the country list.{" "}
                <button type="button" onClick={() => refetchCountries()} className="underline hover:text-ember-300">
                  Try again
                </button>
              </p>
            )}
          </div>
          <div>
            <label className="field-label">City</label>
            <select {...register("cityId")} className="input" disabled={!country} defaultValue="">
              <option value="" disabled>
                {country ? "Select city" : "Select country first"}
              </option>
              {country?.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.cityId && <p className="field-error">{errors.cityId.message}</p>}
          </div>
          <div>
            <label className="field-label">District / neighborhood</label>
            <input {...register("district")} className="input" placeholder="Kacyiru" />
          </div>
          <div>
            <label className="field-label">Street address</label>
            <input {...register("address")} className="input" placeholder="KG 7 Ave" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Price</label>
            <input type="number" step="any" {...register("price", { valueAsNumber: true })} className="input" placeholder="150000" />
            {errors.price && <p className="field-error">{errors.price.message}</p>}
          </div>
          <div>
            <label className="field-label">Currency</label>
            <select {...register("currencyCode")} className="input" defaultValue={country?.currencyCode ?? ""}>
              <option value="" disabled>
                Select currency
              </option>
              {countries.map((c) => (
                <option key={c.currencyCode} value={c.currencyCode}>
                  {c.currencyCode} ({c.currencySymbol})
                </option>
              ))}
            </select>
          </div>
          {listingType !== "SALE" && (
            <div>
              <label className="field-label">Price note</label>
              <input {...register("priceNote")} className="input" placeholder={listingType === "SHORT_STAY" ? "/ night" : "/ month"} />
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Details</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isResidential && (
            <>
              <div>
                <label className="field-label">Bedrooms</label>
                <input type="number" {...register("bedrooms", { valueAsNumber: true })} className="input" />
              </div>
              <div>
                <label className="field-label">Bathrooms</label>
                <input type="number" {...register("bathrooms", { valueAsNumber: true })} className="input" />
              </div>
            </>
          )}
          <div>
            <label className="field-label">Parking</label>
            <input type="number" {...register("parkingSpaces", { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label className="field-label">Size (m²)</label>
            <input type="number" step="any" {...register("sizeSqm", { valueAsNumber: true })} className="input" />
          </div>
          {category === "LAND" && (
            <div>
              <label className="field-label">Land size (m²)</label>
              <input type="number" step="any" {...register("landSizeSqm", { valueAsNumber: true })} className="input" />
            </div>
          )}
          <div>
            <label className="field-label">Year built</label>
            <input type="number" {...register("yearBuilt", { valueAsNumber: true })} className="input" />
          </div>
          {isResidential && (
            <div>
              <label className="field-label">Furnished</label>
              <select {...register("furnished")} className="input" defaultValue="">
                <option value="">Not specified</option>
                {FURNISHED_STATUSES.map((f) => (
                  <option key={f} value={f}>
                    {f.replace("_", "-")}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                selectedAmenities.includes(amenity)
                  ? "border-ember-500/60 bg-ember-500/15 text-ember-300"
                  : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
              )}
            >
              {amenity}
            </button>
          ))}
        </div>
      </section>

      <button type="submit" disabled={submitting} className="btn-primary self-start !px-6 !py-3">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}

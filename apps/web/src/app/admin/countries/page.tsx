"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Globe2, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface CityItem {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
}

interface CountryItem {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  phoneCode: string;
  flagEmoji: string | null;
  isActive: boolean;
  cities: CityItem[];
  _count: { properties: number };
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-green-500" : "bg-white/15"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
          on ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function AdminCountriesPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [addingCityFor, setAddingCityFor] = useState<string | null>(null);

  const { data, isLoading } = useQuery<CountryItem[]>({
    queryKey: ["admin-countries"],
    queryFn: () => api.get<CountryItem[]>("/api/admin/countries"),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin-countries"] });
  }

  async function toggleCountry(id: string, isActive: boolean) {
    try {
      await api.patch(`/api/admin/countries/${id}`, { isActive: !isActive });
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update country");
    }
  }

  async function toggleCity(id: string, isActive: boolean) {
    try {
      await api.patch(`/api/admin/cities/${id}`, { isActive: !isActive });
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update city");
    }
  }

  async function createCountry(form: FormData) {
    try {
      await api.post("/api/admin/countries", {
        code: form.get("code"),
        name: form.get("name"),
        currencyCode: form.get("currencyCode"),
        currencySymbol: form.get("currencySymbol"),
        phoneCode: form.get("phoneCode"),
        flagEmoji: form.get("flagEmoji") || undefined,
      });
      toast.success("Country added");
      setShowAddCountry(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't add country");
    }
  }

  async function createCity(countryId: string, form: FormData) {
    const lat = form.get("lat");
    const lng = form.get("lng");
    try {
      await api.post(`/api/admin/countries/${countryId}/cities`, {
        name: form.get("name"),
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
      });
      toast.success("City added");
      setAddingCityFor(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't add city");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Countries & cities</h1>
        <button
          onClick={() => setShowAddCountry((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-aurora-500 px-3.5 py-1.5 text-xs font-semibold text-void-950 hover:bg-aurora-400"
        >
          <Plus className="h-3.5 w-3.5" /> Add country
        </button>
      </div>

      {showAddCountry && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCountry(new FormData(e.currentTarget));
          }}
          className="glass-card mb-4 grid grid-cols-2 gap-3 p-4 sm:grid-cols-3"
        >
          <input name="code" placeholder="Code (e.g. KE)" maxLength={2} required className="input" />
          <input name="name" placeholder="Name" required className="input" />
          <input name="currencyCode" placeholder="Currency code (e.g. KES)" maxLength={3} required className="input" />
          <input name="currencySymbol" placeholder="Currency symbol" required className="input" />
          <input name="phoneCode" placeholder="Phone code (e.g. +254)" required className="input" />
          <input name="flagEmoji" placeholder="Flag emoji (optional)" className="input" />
          <div className="col-span-2 flex gap-2 sm:col-span-3">
            <button type="submit" className="rounded-full bg-aurora-500 px-4 py-1.5 text-xs font-semibold text-void-950 hover:bg-aurora-400">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddCountry(false)}
              className="rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/[0.1]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Globe2 className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/40">No countries yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((c) => {
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="text-xl">{c.flagEmoji ?? "🌍"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {c.name} <span className="text-white/30">({c.code})</span>
                    </p>
                    <p className="text-xs text-white/40">
                      {c.currencySymbol} {c.currencyCode} · {c.phoneCode} · {c.cities.length} cities ·{" "}
                      {c._count.properties} listings
                    </p>
                  </div>
                  <Toggle on={c.isActive} onToggle={() => toggleCountry(c.id, c.isActive)} />
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Cities</p>
                      <button
                        onClick={() => setAddingCityFor(addingCityFor === c.id ? null : c.id)}
                        className="flex items-center gap-1 text-xs font-medium text-ember-400 hover:text-ember-300"
                      >
                        <Plus className="h-3 w-3" /> Add city
                      </button>
                    </div>

                    {addingCityFor === c.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          createCity(c.id, new FormData(e.currentTarget));
                        }}
                        className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.03] p-3"
                      >
                        <input name="name" placeholder="City name" required className="input" />
                        <input name="lat" type="number" step="any" placeholder="Lat (optional)" className="input" />
                        <input name="lng" type="number" step="any" placeholder="Lng (optional)" className="input" />
                        <div className="col-span-3 flex gap-2">
                          <button type="submit" className="rounded-full bg-aurora-500 px-3 py-1 text-[11px] font-semibold text-void-950 hover:bg-aurora-400">
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingCityFor(null)}
                            className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/60 hover:bg-white/[0.1]"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {c.cities.length === 0 ? (
                      <p className="text-xs text-white/30">No cities yet.</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {c.cities.map((city) => (
                          <div key={city.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/30" />
                            <span className="flex-1 text-sm text-white/80">{city.name}</span>
                            {city.lat != null && city.lng != null && (
                              <span className="text-[11px] text-white/30">
                                {city.lat.toFixed(3)}, {city.lng.toFixed(3)}
                              </span>
                            )}
                            <Toggle on={city.isActive} onToggle={() => toggleCity(city.id, city.isActive)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const EXAMPLES = [
  "3 bedroom apartment in Kigali under $1,000",
  "Verified villas for sale in Lagos",
  "Furnished short stay in Accra",
  "Commercial land in Nairobi",
  "2 bedroom house for rent in Kampala with 3D tour",
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(q: string) {
    const value = q.trim();
    if (!value) return;
    router.push(`/listings?q=${encodeURIComponent(value)}`);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="section-label mb-3">Intelligent search</p>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Tell us what you're looking for.
      </h1>
      <p className="mt-3 max-w-lg text-white/50">
        Type naturally — location, price, bedrooms, and features all work in one search.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full glass p-2 pl-5"
      >
        <Search className="h-5 w-5 shrink-0 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="3 bedroom apartment in Kigali under $1,000"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          autoFocus
        />
        <button type="submit" className="btn-primary !px-5 !py-2.5 text-sm">
          Search
        </button>
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => submit(ex)} className="chip hover:bg-white/[0.1]">
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

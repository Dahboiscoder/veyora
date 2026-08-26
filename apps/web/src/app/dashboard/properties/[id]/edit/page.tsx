"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Loader2, Radio, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import { PropertyForm, type PropertyFormValues } from "@/components/dashboard/PropertyForm";
import { MediaManager } from "@/components/dashboard/MediaManager";
import Link from "next/link";

interface PropertyDetail extends PropertyFormValues {
  id: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  media: any[];
}

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [startingLive, setStartingLive] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const { data: property, isLoading } = useQuery<PropertyDetail>({
    queryKey: ["dashboard-property", params.id],
    queryFn: () => api.get<PropertyDetail>(`/api/properties/${params.id}`),
  });

  async function handleSubmit(values: PropertyFormValues) {
    setSubmitting(true);
    try {
      await api.patch(`/api/properties/${params.id}`, values);
      toast.success("Property updated");
      queryClient.invalidateQueries({ queryKey: ["dashboard-property", params.id] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setSubmitting(false);
    }
  }

  async function publish() {
    try {
      const result = await api.patch<{ possibleDuplicateOf: string | null }>(`/api/properties/${params.id}/status`, {
        status: "PUBLISHED",
      });
      toast.success("Property published!");
      if (result.possibleDuplicateOf) {
        toast.info("This listing looks similar to another one of yours — flagged for admin review.");
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard-property", params.id] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't publish");
    }
  }

  async function startLive() {
    if (!property) return;
    setStartingLive(true);
    try {
      const stream = await api.post<{ id: string }>("/api/live", { propertyId: property.id, title: `Live tour: ${property.title}` });
      router.push(`/live/${stream.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start live tour");
    } finally {
      setStartingLive(false);
    }
  }

  async function promote() {
    if (!property) return;
    setPromoting(true);
    try {
      const res = await api.post<{ url: string }>("/api/payments/checkout/featured", { propertyId: property.id, days: 7 });
      window.location.href = res.url;
    } catch (err) {
      if (err instanceof ApiError && err.status === 501) {
        toast.info("Payments aren't configured in this environment yet — add a Stripe secret key to enable checkout.");
      } else {
        toast.error(err instanceof ApiError ? err.message : "Couldn't start checkout");
      }
    } finally {
      setPromoting(false);
    }
  }

  if (isLoading || !property) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">{property.title}</h1>
          <p className="mt-1 text-xs text-white/40">Status: {property.status.replace("_", " ")}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/property/${property.slug}`} target="_blank" className="btn-secondary !px-3.5 !py-2 text-sm">
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </Link>
          {property.status === "DRAFT" && (
            <button onClick={publish} className="btn-primary !px-3.5 !py-2 text-sm">
              Publish
            </button>
          )}
          {property.status === "PUBLISHED" && !property.isFeatured && (
            <button onClick={promote} disabled={promoting} className="btn-secondary !px-3.5 !py-2 text-sm">
              <Sparkles className="h-3.5 w-3.5" /> Promote ($2/day)
            </button>
          )}
          {property.status === "PUBLISHED" && (
            <button onClick={startLive} disabled={startingLive} className="btn-primary !bg-red-500 !from-red-500 !to-red-500 !px-3.5 !py-2 text-sm">
              <Radio className="h-3.5 w-3.5" /> Go Live
            </button>
          )}
        </div>
      </div>

      <section className="glass-card mb-8 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Media</h2>
        <MediaManager
          propertyId={property.id}
          media={property.media}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ["dashboard-property", params.id] })}
        />
      </section>

      <section className="glass-card p-6">
        <PropertyForm defaultValues={property} onSubmit={handleSubmit} submitting={submitting} submitLabel="Save changes" />
      </section>
    </div>
  );
}

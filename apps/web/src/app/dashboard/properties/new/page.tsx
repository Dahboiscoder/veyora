"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PropertyForm, type PropertyFormValues } from "@/components/dashboard/PropertyForm";
import { api, ApiError } from "@/lib/api/client";

export default function NewPropertyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: PropertyFormValues) {
    setSubmitting(true);
    try {
      const property = await api.post<{ id: string }>("/api/properties", values);
      toast.success("Draft created — now add photos and media");
      router.push(`/dashboard/properties/${property.id}/edit`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create property");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 font-display text-2xl font-semibold text-white">Add a property</h1>
      <p className="mb-8 text-sm text-white/50">Start with the basics — you'll add photos, video, and 3D tours next.</p>
      <PropertyForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Continue to media" />
    </div>
  );
}

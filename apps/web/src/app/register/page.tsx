"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, User, Lock, Building2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@nyumba/shared";
import { AuthShell, OAuthNotice } from "@/components/auth/AuthShell";
import { api, ApiError } from "@/lib/api/client";
import { useCountries } from "@/hooks/useCountries";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "USER", label: "Buyer / Renter", desc: "Browse & save properties" },
  { value: "OWNER", label: "Property Owner", desc: "List your own property" },
  { value: "AGENT", label: "Agent", desc: "Sell or rent on behalf of clients" },
  { value: "COMPANY", label: "Agency", desc: "Manage a team of agents" },
] as const;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { countries, isLoading: countriesLoading, isError: countriesError, refetch: refetchCountries } = useCountries();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: (searchParams.get("role") as RegisterInput["role"]) ?? "USER",
    },
  });

  const role = watch("role");

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      await api.post("/api/auth/register", data);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push(["OWNER", "AGENT", "COMPANY"].includes(data.role) ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join VEYORA to save properties, message agents, or start listing."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ember-400 hover:text-ember-300">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="field-label">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("role", opt.value)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors",
                  role === opt.value ? "border-ember-500/60 bg-ember-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
              >
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-[11px] text-white/45">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input {...register("name")} placeholder="Amara Okafor" className="input pl-10" />
          </div>
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        {role === "COMPANY" && (
          <div>
            <label className="field-label">Agency name</label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input {...register("companyName")} placeholder="Prime Properties Ltd" className="input pl-10" />
            </div>
            {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
          </div>
        )}

        <div>
          <label className="field-label">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input {...register("email")} type="email" placeholder="you@example.com" className="input pl-10" />
          </div>
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="field-label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input {...register("password")} type="password" placeholder="At least 8 characters" className="input pl-10" />
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <div>
          <label className="field-label">Country</label>
          <select
            {...register("countryCode")}
            className="input"
            defaultValue=""
            disabled={countriesLoading || countriesError}
          >
            <option value="" disabled>
              {countriesLoading ? "Loading countries…" : countriesError ? "Couldn't load countries" : "Select your country"}
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flagEmoji} {c.name}
              </option>
            ))}
          </select>
          {countriesError && (
            <p className="field-error">
              Couldn't load the country list.{" "}
              <button type="button" onClick={() => refetchCountries()} className="underline hover:text-ember-300">
                Try again
              </button>
            </p>
          )}
        </div>

        {serverError && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
      <OAuthNotice />
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

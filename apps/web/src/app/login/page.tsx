"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Mail } from "lucide-react";
import { loginSchema, type LoginInput } from "@nyumba/shared";
import { AuthShell, OAuthNotice } from "@/components/auth/AuthShell";
import { api, ApiError } from "@/lib/api/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      const user = await api.post<{ role: string }>("/api/auth/login", data);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo ?? (["OWNER", "AGENT", "COMPANY", "ADMIN"].includes(user.role) ? "/dashboard" : "/"));
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to save properties, message agents, and manage your listings."
      footer={
        <>
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-ember-400 hover:text-ember-300">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <input {...register("password")} type="password" placeholder="••••••••" className="input pl-10" />
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        {serverError && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/50">
        <p className="mb-1 font-semibold text-white/70">Try the demo</p>
        demo@veyora.dev / Veyora2026! · agent1@kigali-prime-properties.dev / Veyora2026! · admin@veyora.dev / Veyora2026!
      </div>

      <OAuthNotice />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

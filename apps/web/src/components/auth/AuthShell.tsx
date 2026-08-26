import Link from "next/link";
import { Box, Radio, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const POINTS = [
  { icon: Box, text: "Tour properties in 3D before you ever visit" },
  { icon: Radio, text: "Join live walkthroughs hosted by verified agents" },
  { icon: ShieldCheck, text: "Every listing screened for trust & accuracy" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-void-950">
      <div className="absolute inset-0 bg-grid-glow opacity-60" />
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:block">
          <Logo className="mb-10" />
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            The most immersive way to find your next place.
          </h1>
          <ul className="mt-10 flex flex-col gap-5">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl glass">
                  <p.icon className="h-5 w-5 text-ember-400" />
                </div>
                <p className="text-sm text-white/60">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card mx-auto w-full max-w-md p-8">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-1.5 text-sm text-white/50">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-white/50">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function OAuthNotice() {
  return (
    <p className="mt-4 text-center text-xs text-white/30">
      By continuing you agree to VEYORA's{" "}
      <Link href="/legal/terms" className="underline hover:text-white/50">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/legal/privacy" className="underline hover:text-white/50">
        Privacy Policy
      </Link>
      .
    </p>
  );
}

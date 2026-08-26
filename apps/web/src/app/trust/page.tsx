import { BadgeCheck, Flag, ShieldCheck, Users } from "lucide-react";
import { StaticPage } from "@/components/ui/StaticPage";

const POINTS = [
  {
    icon: BadgeCheck,
    title: "Verified badges",
    body: "Properties, agents, and agencies can all carry a Verified badge once our team confirms ownership documents, agency registration, or identity — shown throughout search, listings, and profiles.",
  },
  {
    icon: Flag,
    title: "Report anything",
    body: "Every listing has a Report button covering fraud, duplicates, misleading info, and content that's already sold or rented. Reports go straight to the admin queue for review.",
  },
  {
    icon: Users,
    title: "Manual admin review",
    body: "New listings can be routed through Pending Review before going live, and our admin team can approve, reject, or re-verify any listing or account at any time.",
  },
  {
    icon: ShieldCheck,
    title: "Account safety",
    body: "Passwords are hashed, sessions use short-lived access tokens with rotating refresh tokens, and admins can suspend an account instantly if something looks wrong.",
  },
];

export const metadata = { title: "Trust & Verification" };

export default function TrustPage() {
  return (
    <StaticPage title="Trust & Verification">
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title} className="glass-card p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-ember-500/15">
              <p.icon className="h-4.5 w-4.5 text-ember-400" />
            </div>
            <p className="mb-1.5 text-sm font-semibold text-white">{p.title}</p>
            <p className="text-sm text-white/55">{p.body}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}

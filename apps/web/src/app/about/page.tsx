import { StaticPage } from "@/components/ui/StaticPage";
import { LAUNCH_COUNTRIES } from "@nyumba/shared";

export const metadata = { title: "About VEYORA" };

export default function AboutPage() {
  return (
    <StaticPage title="About VEYORA">
      <p>
        VEYORA is a real-estate marketplace built for Africa, combining traditional property listings
        with 3D tours, 360° panoramas, live-hosted viewings, and short-form video discovery — so buyers
        and renters can experience a property before they ever visit in person.
      </p>
      <p>Live today across {LAUNCH_COUNTRIES.length} countries: {LAUNCH_COUNTRIES.map((c) => c.name).join(", ")}.</p>
      <p className="text-xs text-white/30">
        This is a development prototype. Company details, team information, and press contacts will be
        added here ahead of a public launch.
      </p>
    </StaticPage>
  );
}

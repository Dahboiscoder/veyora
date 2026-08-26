import { StaticPage } from "@/components/ui/StaticPage";

const FAQS = [
  {
    q: "How do 3D and 360° tours work?",
    a: "Any listing with a 3D Tour or 360° Tour badge has an interactive experience you can open right from its photo gallery. Drag to look around, and on 3D tours, scroll to zoom. No app or plugin needed — it runs in your browser.",
  },
  {
    q: "How do live tours work?",
    a: "Agents can start a live tour from a published listing. While it's live, you can watch, see the viewer count, chat with the host in real time, and request a private viewing without leaving the page.",
  },
  {
    q: "What does the Verified badge mean?",
    a: "A Verified badge on a property, agent, or agency means VEYORA's admin team has reviewed and confirmed it. Unverified doesn't necessarily mean something is wrong — it may just be newly listed.",
  },
  {
    q: "How do I list a property?",
    a: "Create an account as an Owner, Agent, or Agency, then use \"List Your Property\" to add details, photos, video, and optionally a 3D model or 360° panorama. New listings start as drafts until you publish them.",
  },
  {
    q: "Is messaging private?",
    a: "Yes — conversations are only visible to their participants. Messages are delivered in real time while you're online and stored so you can catch up later.",
  },
];

export const metadata = { title: "Help Center" };

export default function HelpPage() {
  return (
    <StaticPage title="Help Center">
      <div className="not-prose flex flex-col gap-3">
        {FAQS.map((f) => (
          <details key={f.q} className="glass-card group p-5">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">{f.q}</summary>
            <p className="mt-2 text-sm text-white/55">{f.a}</p>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}

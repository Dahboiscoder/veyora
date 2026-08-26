import { StaticPage } from "@/components/ui/StaticPage";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <StaticPage title="Contact us">
      <p>
        This prototype doesn't have a live support inbox yet. Once real contact channels exist, this
        page should list them (support email, WhatsApp business line, physical offices per country) —
        placeholders aren't shown here so nothing on this page could be mistaken for a real, working
        contact method.
      </p>
      <p>
        In the meantime, if you're signed in you can message any agent or agency directly from their
        listing or profile page.
      </p>
    </StaticPage>
  );
}

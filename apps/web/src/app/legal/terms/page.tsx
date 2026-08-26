import { StaticPage } from "@/components/ui/StaticPage";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service">
      <p>
        <strong>This is placeholder content for a development prototype.</strong> VEYORA is not yet a
        registered company and this page does not constitute a real, binding legal agreement.
      </p>
      <p>
        Before taking this platform to production, replace this page with real terms of service drafted
        or reviewed by a qualified lawyer, covering account eligibility, listing accuracy obligations,
        prohibited conduct, payment and refund terms, dispute resolution, and liability limits
        appropriate to each country VEYORA operates in.
      </p>
    </StaticPage>
  );
}

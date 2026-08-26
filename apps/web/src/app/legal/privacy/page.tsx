import { StaticPage } from "@/components/ui/StaticPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p>
        <strong>This is placeholder content for a development prototype.</strong> This page does not
        constitute a real, binding privacy policy.
      </p>
      <p>
        VEYORA's schema currently stores: account details (name, email, phone, password hash), property
        listings and media, messages between users, favorites and follows, viewing requests, and payment
        records. Before production use, replace this page with a real privacy policy covering what's
        collected, how it's used, retention periods, third-party processors (storage, maps, payments,
        analytics), and the specific data protection law in force in each launch country — verify the
        current statute and requirements for each one with local counsel rather than assuming.
      </p>
    </StaticPage>
  );
}

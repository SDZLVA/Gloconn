import {
  LegalDocument,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalDocument";
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal/constants";

export const metadata = {
  title: "Privacy Policy — Glooconn",
  description:
    "What personal data Glooconn collects, why, how long it is kept, and the rights you have over it.",
};

/** Privacy policy — plain-language, reflects what the app actually does. */
export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      description="What we collect, why we collect it, and what you can ask us to do with it."
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <LegalSection heading="Who we are">
        <p>
          Glooconn is a travel planning website that searches flights and hotels
          and combines them into complete trip options. In data protection law
          we are the &ldquo;controller&rdquo; of the personal data described
          below. You can reach us at{" "}
          <a className="font-medium text-brand-700 underline" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <LegalList
          items={[
            <>
              <strong>Search details</strong> — where you are travelling from and
              to, your dates, number of travellers and any budget you enter. You
              do not need an account to search.
            </>,
            <>
              <strong>Account details</strong> — if you create an account, your
              email address and, when you sign in with Google, the basic profile
              information Google returns. Passwords are handled by our
              authentication provider and are never visible to us.
            </>,
            <>
              <strong>Saved trips</strong> — the search criteria you choose to
              save, linked to your account.
            </>,
            <>
              <strong>Technical records</strong> — our servers keep short-lived
              logs that include your IP address. We use them to stop one visitor
              overloading the site and to investigate faults.
            </>,
          ]}
        />
        <p>
          We do not ask for payment details, because Glooconn does not take
          bookings or payments.
        </p>
      </LegalSection>

      <LegalSection heading="Why we use it, and our legal basis">
        <LegalList
          items={[
            <>
              To run the search and show you results — this is necessary to
              provide the service you asked for.
            </>,
            <>
              To keep your account and saved trips working — necessary to provide
              the service.
            </>,
            <>
              To protect the site from abuse and to fix faults — our legitimate
              interest in keeping the service available and secure.
            </>,
          ]}
        />
        <p>
          We do not use your data for advertising, and we do not sell it to
          anyone.
        </p>
      </LegalSection>

      <LegalSection heading="Who else processes your data">
        <p>
          We use a small number of service providers. They only process data on
          our instructions.
        </p>
        <LegalList
          items={[
            <>
              <strong>Supabase</strong> — accounts, sign-in and the database that
              holds saved trips.
            </>,
            <>
              <strong>Vercel</strong> — hosting and server logs.
            </>,
            <>
              <strong>SerpAPI</strong> — retrieves live flight and hotel prices.
              We send the travel details of a search (such as cities and dates).
              We do not send your name, email address or account identifier.
            </>,
          ]}
        />
        <p>
          Some of these providers operate outside the European Economic Area. In
          that case transfers rely on the safeguards those providers publish,
          such as the European Commission&rsquo;s standard contractual clauses.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          Glooconn sets cookies only to keep you signed in and to keep your
          session secure. These are necessary for the site to work, so no consent
          banner is shown for them. We do not currently use advertising or
          analytics cookies. If that changes, we will ask for your consent first
          and update this page.
        </p>
        <p>
          Your browser may also store small amounts of information on your own
          device, such as your recent destination searches, so the search form
          can suggest them again. That information stays on your device and is
          not sent to us.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <LegalList
          items={[
            <>Account details and saved trips: until you delete them or ask us to close your account.</>,
            <>Technical logs: a short period, typically no more than 30 days.</>,
            <>Search details entered without an account: not stored after the search.</>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          If you are in the UK or the European Economic Area you can ask us to
          give you a copy of your data, correct it, delete it, restrict how we
          use it, or object to our use of it. You can also ask for your data in a
          portable format.
        </p>
        <p>
          Write to{" "}
          <a className="font-medium text-brand-700 underline" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>{" "}
          and we will respond within one month. If you are unhappy with our
          answer you can complain to your national data protection authority.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          Glooconn is not aimed at children under 16, and we do not knowingly
          collect their data. If you believe a child has created an account,
          contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we change how we handle personal data we will update this page and
          change the date at the top. Significant changes will be announced on
          the site.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

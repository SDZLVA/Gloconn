import {
  LegalDocument,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalDocument";
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal/constants";

export const metadata = {
  title: "Terms of Use — Glooconn",
  description:
    "The rules for using Glooconn, what the service does and does not do, and the limits of our responsibility.",
};

/** Terms of use — written to match what the product actually does today. */
export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      description="The agreement between you and Glooconn when you use this website."
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <LegalSection heading="1. About these terms">
        <p>
          By using Glooconn you accept these terms. If you do not accept them,
          please do not use the site. We may update them; the date at the top
          shows when they last changed.
        </p>
      </LegalSection>

      <LegalSection heading="2. What Glooconn does">
        <p>
          Glooconn searches flights and accommodation from third-party sources,
          combines them into complete trip options, and shows them to you with an
          explanation of why each one is suggested.
        </p>
        <p className="font-medium text-slate-900">
          Glooconn does not sell travel. We are not a travel agency, we do not
          take bookings, and we never handle payments. Any booking you make is a
          contract between you and the airline, hotel or booking site concerned.
        </p>
      </LegalSection>

      <LegalSection heading="3. Prices and availability">
        <p>
          Prices and availability come from third parties and change constantly.
          We show the information we receive at the moment you search, which may
          already be out of date by the time you reach the provider. Prices are
          estimates for comparison, not offers.
        </p>
        <p>
          We check prices as carefully as we reasonably can, and we would rather
          show you nothing than show you a figure we cannot stand behind. Even
          so, always confirm the final price, baggage rules, taxes and
          cancellation terms with the provider before you book.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your account">
        <p>
          You are responsible for keeping your sign-in details secure and for
          activity under your account. Tell us promptly if you think someone else
          has access. You can ask us to close your account at any time.
        </p>
      </LegalSection>

      <LegalSection heading="5. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            <>use automated tools to scrape, copy or overload the site;</>,
            <>attempt to break, bypass or probe our security measures;</>,
            <>resell or redistribute the data the site shows;</>,
            <>use the service for anything unlawful.</>,
          ]}
        />
        <p>
          We may limit or suspend access that threatens the stability of the
          service or breaks these rules.
        </p>
      </LegalSection>

      <LegalSection heading="6. Partner links and commission">
        <p>
          Glooconn may include links to booking partners. Where that is the case,
          we may receive a commission if you complete a booking after following
          one of those links, at no extra cost to you. Links of that kind are
          marked on the page where they appear.
        </p>
        <p>
          Commission never changes the order in which results are shown. Rankings
          and labels are produced by the same rules for every result.
        </p>
      </LegalSection>

      <LegalSection heading="7. Availability">
        <p>
          Glooconn is provided as it is. We do not promise that the service will
          always be available, uninterrupted or free of errors, and parts of it
          may change or be withdrawn.
        </p>
      </LegalSection>

      <LegalSection heading="8. Our responsibility">
        <p>
          We are responsible for loss caused by our failure to use reasonable
          care and skill, but we are not responsible for losses that arise from
          your dealings with airlines, hotels or booking sites, from prices or
          availability changing, or from travel plans made on the basis of
          information shown here.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited by law,
          including liability for death or personal injury caused by negligence,
          or for fraud. If you use Glooconn as a consumer, you keep all the
          rights the law of your country gives you.
        </p>
      </LegalSection>

      <LegalSection heading="9. Our content">
        <p>
          The Glooconn name, logo, design and software belong to us. Travel data
          shown on the site belongs to the providers it comes from. You may use
          the site for your own travel planning, not for commercial reuse.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <p>
          Questions about these terms:{" "}
          <a className="font-medium text-brand-700 underline" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

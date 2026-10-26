import { type Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "~/components/legal-links";
import {
  ANALYTICS_RETENTION,
  CONSENT_LOG_RETENTION_YEARS,
  CONTROLLER,
  PRIVACY_POLICY_UPDATED,
} from "~/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy – Bojko Drive",
  description: "How Bojko Drive processes your personal data and uses cookies.",
};

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-foreground text-xl font-black tracking-tight uppercase">
        {title}
      </h2>
      <div className="text-muted-foreground mt-4 space-y-4 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="border-border overflow-x-auto border-2">
      <table className="w-full min-w-xl text-left text-sm">
        <thead className="border-border text-foreground border-b-2">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-border border-t align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="text-foreground text-4xl leading-none font-black tracking-tight uppercase md:text-5xl">
        Privacy Policy
      </h1>
      <div className="bg-primary mt-6 h-1.25 w-24" />
      <p className="text-muted-foreground mt-6 text-sm">
        Last updated: {PRIVACY_POLICY_UPDATED}
      </p>
      <p className="text-muted-foreground mt-6 leading-relaxed">
        This policy explains what personal data Bojko Drive processes, why, for
        how long, and what rights you have. It is provided in accordance with
        Articles 13 and 14 of Regulation (EU) 2016/679 (the GDPR) and Czech Act
        No. 110/2019 Coll. on personal data processing, and it also covers the
        use of cookies under Section 89(3) of Czech Act No. 127/2005 Coll. on
        electronic communications.
      </p>

      <Section title="1. Who is the controller">
        <p>
          The controller of your personal data is{" "}
          <strong className="text-foreground">{CONTROLLER.name}</strong>,{" "}
          {CONTROLLER.address} (&quot;we&quot;, &quot;us&quot;).
        </p>
        <p>
          Contact for all privacy matters:{" "}
          <strong className="text-foreground">{CONTROLLER.email}</strong>.
        </p>
        <p>
          We have not appointed a data protection officer, because we are not
          required to by Article 37 GDPR.
        </p>
      </Section>

      <Section title="2. What data we process, why, and on what legal basis">
        <Table
          head={["Data", "Purpose", "Legal basis", "Retention"]}
          rows={[
            [
              "Account data: e-mail address, name and profile picture (depending on your sign-in method), user ID",
              "Creating and running your account, signing you in",
              "Art. 6(1)(b) GDPR – performance of the contract (providing the service you asked for)",
              "Until you delete your account",
            ],
            [
              "Your files and folders: file names, file contents, sizes, folder structure, upload dates",
              "Storing and displaying your files, enforcing the storage limit",
              "Art. 6(1)(b) GDPR – performance of the contract",
              "Until you delete the file or folder, or your account",
            ],
            [
              "Technical data: IP address, browser and device type, request time, error logs",
              "Security, abuse prevention, keeping the service running",
              "Art. 6(1)(f) GDPR – our legitimate interest in a secure and working service",
              "Short-term, as set by our hosting and authentication providers (typically days to weeks)",
            ],
            [
              "Analytics data (only if you accept analytics cookies): pages viewed, browser and device type, approximate location derived from IP address, and – when you are signed in – your user ID and e-mail address",
              "Understanding how the site is used so we can improve it",
              "Art. 6(1)(a) GDPR – your consent (and Section 89(3) of Act No. 127/2005 Coll. for the cookie/storage access)",
              `Up to ${ANALYTICS_RETENTION}, or until you withdraw consent and ask for deletion`,
            ],
            [
              "Record of your choices (cookie choice and confirmation of this policy): a random ID generated in your browser, the choice, policy version, time, and a keyed hash of your IP address. No name, e-mail or user ID",
              "Being able to demonstrate that you gave (or declined) consent",
              "Art. 6(1)(c) GDPR in connection with Art. 7(1) GDPR and Section 89(3) of Act No. 127/2005 Coll. – legal obligation to be able to prove consent",
              `${CONSENT_LOG_RETENTION_YEARS} years from the record`,
            ],
          ]}
        />
        <p>
          <strong className="text-foreground">Confirmation before sign-up.</strong>{" "}
          Before you register we ask you to tick a box confirming that you agree
          to the processing of personal data described here. Processing that is
          necessary to provide the service rests on the contract (see the table
          above); the box confirms that you have been informed about it. A record
          of this confirmation is stored in your browser and, as proof, in our
          database (see the last row of the table above). The record cannot be
          linked to you without the random ID stored in your browser; if you
          want it deleted, send us that ID (visible in your browser&apos;s
          local storage under &quot;bojko-drive:consent-id&quot;).
        </p>
        <p>
          We do not sell your data, we do not show advertising, and we do not use
          your files for anything other than showing them back to you.
        </p>
      </Section>

      <Section title="3. Is providing the data mandatory">
        <p>
          Providing account data and uploading files is voluntary, but without
          an account we cannot provide the service. Analytics are entirely
          optional: if you choose &quot;Only necessary&quot;, everything keeps
          working.
        </p>
      </Section>

      <Section id="cookies" title="4. Cookies and similar technologies">
        <p>
          We use two kinds of cookies and local browser storage. Strictly
          necessary ones are always on, because the service cannot work without
          them and the law does not require your consent for them. Analytics
          ones are used{" "}
          <strong className="text-foreground">only if you click &quot;Accept all&quot;</strong>
          . Both choices are equally easy, nothing is pre-selected, and the site
          works fully either way.
        </p>
        <Table
          head={["Name", "Provider", "Purpose", "Lifetime"]}
          rows={[
            [
              <strong key="n1" className="text-foreground">
                Strictly necessary
              </strong>,
              "",
              "",
              "",
            ],
            [
              "__session, __client_uat (and similar, e.g. __clerk_db_jwt)",
              "Clerk (authentication)",
              "Keeps you signed in and protects your session",
              "Session to a few days, as set by Clerk",
            ],
            [
              "bojko-drive:cookie-consent, bojko-drive:privacy-consent, bojko-drive:consent-id (browser storage)",
              "Bojko Drive",
              "Remembers your cookie choice and your confirmation of this policy; the random ID links your choices in our consent log",
              "Cookie choice: 12 months if accepted, 6 months if declined",
            ],
            [
              <strong key="n2" className="text-foreground">
                Analytics (only with your consent)
              </strong>,
              "",
              "",
              "",
            ],
            [
              "ph_…_posthog (cookie / browser storage)",
              "PostHog",
              "Recognises your browser to measure page views and usage",
              "Up to 12 months",
            ],
          ]}
        />
        <p>
          You can change your mind at any time with one click:{" "}
          <CookieSettingsButton className="text-primary cursor-pointer underline underline-offset-4" />{" "}
          (also available in the footer of the home page). Withdrawing consent
          stops analytics immediately and does not affect earlier processing.
          If you decline, we will not ask again for at least 6 months; if you
          accept, we will ask again after 12 months.
        </p>
      </Section>

      <Section title="5. Who receives your data">
        <p>
          We share data only with service providers (processors) who work for
          us under data processing agreements, and only as needed for the
          purposes above:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong className="text-foreground">Clerk</strong> – authentication
            and account management.
          </li>
          <li>
            <strong className="text-foreground">UploadThing</strong> – upload and
            storage of your files.
          </li>
          <li>
            <strong className="text-foreground">SingleStore</strong> – database
            holding your folder structure and file metadata.
          </li>
          <li>
            <strong className="text-foreground">Netlify</strong> – web hosting.
          </li>
          <li>
            <strong className="text-foreground">PostHog</strong> – product
            analytics, only if you accepted analytics cookies.
          </li>
        </ul>
        <p>
          We may also disclose data to public authorities if the law requires
          it.
        </p>
      </Section>

      <Section title="6. Transfers outside the EU/EEA">
        <p>
          Some of the providers above process data in the United States or other
          countries outside the European Economic Area. Such transfers rely on
          an adequacy decision of the European Commission (such as the EU–US
          Data Privacy Framework for certified providers) or on the Standard
          Contractual Clauses approved by the European Commission, together with
          additional safeguards where needed. You can request a copy of the
          safeguards by contacting us.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>Under the GDPR you have the right to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>access your data and receive a copy (Art. 15),</li>
          <li>have inaccurate data corrected (Art. 16),</li>
          <li>have your data erased (&quot;right to be forgotten&quot;, Art. 17),</li>
          <li>restrict processing (Art. 18),</li>
          <li>
            receive your data in a structured, machine-readable format and
            transmit it to another controller (Art. 20),
          </li>
          <li>
            object to processing based on legitimate interests (Art. 21), and
          </li>
          <li>
            withdraw your consent at any time (Art. 7(3)) – as easily as you
            gave it – without affecting the lawfulness of processing before the
            withdrawal.
          </li>
        </ul>
        <p>
          To exercise any of these rights, write to {CONTROLLER.email}. We will
          answer within one month. You can delete your files yourself at any time
          inside the app.
        </p>
        <p>
          You also have the right to lodge a complaint with a supervisory
          authority. In the Czech Republic this is the Office for Personal Data
          Protection (Úřad pro ochranu osobních údajů), Pplk. Sochora 27, 170 00
          Praha 7,{" "}
          <a
            href="https://www.uoou.gov.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            www.uoou.gov.cz
          </a>
          , or with the authority in your own EU member state.
        </p>
      </Section>

      <Section title="8. Automated decision-making">
        <p>
          We do not use automated decision-making or profiling that produces
          legal or similarly significant effects on you (Art. 22 GDPR).
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          Bojko Drive is not intended for persons under 15 years of age. If you
          are younger, you may use the service only with the consent of your
          parent or legal guardian.
        </p>
      </Section>

      <Section title="10. Security">
        <p>
          Data is transmitted over encrypted connections (HTTPS), access to
          your files in the app requires signing in, and access to our systems
          is limited. No system is perfectly secure; if a breach puts
          your rights at risk we will notify you and the authority as required by
          Articles 33 and 34 GDPR.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>
          We may update this policy when the service or the law changes. The
          date of the latest version is shown at the top. If a change is
          significant, we will ask you to confirm the new version.
        </p>
      </Section>

      <p className="mt-16">
        <Link
          href="/"
          className="text-primary text-sm underline underline-offset-4"
        >
          ← Back to Bojko Drive
        </Link>
      </p>
    </article>
  );
}

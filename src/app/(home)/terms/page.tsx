import { type Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "~/components/legal-page";
import { DRIVE_LIMIT_MB } from "~/lib/storage-limit";
import { CONTROLLER, TERMS_UPDATED } from "~/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules for using Bojko Drive, provider identification and how to report illegal content.",
};

const linkClass = "text-primary underline underline-offset-4";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={TERMS_UPDATED}>
      <p className="text-muted-foreground mt-6 leading-relaxed">
        These terms govern your use of Bojko Drive, a free personal file storage
        service. By creating an account you agree to them. How we handle
        personal data is described in the{" "}
        <Link href="/privacy" className={linkClass}>
          Privacy Policy
        </Link>
        .
      </p>

      <LegalSection title="1. Who provides the service">
        <p>
          The service is provided by{" "}
          <strong className="text-foreground">{CONTROLLER.name}</strong>,{" "}
          {CONTROLLER.address} (&quot;we&quot;, &quot;us&quot;). Contact for
          users, for authorities and for reports of illegal content (Articles 11
          and 12 of Regulation (EU) 2022/2065, the Digital Services Act, and
          Section 5 of Czech Act No. 480/2004 Coll.):{" "}
          <strong className="text-foreground">{CONTROLLER.email}</strong>. You
          may write to us in Czech or English.
        </p>
      </LegalSection>

      <LegalSection title="2. The service and your account">
        <ul className="list-disc space-y-1 pl-6">
          <li>
            You need an account to use Bojko Drive. Provide accurate sign-in
            details and keep them secure; you are responsible for activity in
            your account.
          </li>
          <li>
            The service is for people aged 15 or older, or younger users with
            the consent of a parent or legal guardian.
          </li>
          <li>
            Each account has a storage limit of {DRIVE_LIMIT_MB} MB. Uploads
            that would exceed it are rejected.
          </li>
          <li>
            The service is free. We may change it, add limits or stop it, and we
            will try to give notice in advance where reasonably possible.
          </li>
          <li>
            You can delete your account at any time in the account menu. Your
            files and folders are then erased.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Your files">
        <p>
          Your files remain yours. You give us only the permission needed to run
          the service: to store them, to show them back to you and to delete
          them when you ask. We do not look into your files, sell them or use
          them for anything else.
        </p>
        <p>You must not upload or share files that:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            are illegal in the Czech Republic or the EU, including material that
            sexually exploits children, incites violence or hatred, or is
            terrorist content;
          </li>
          <li>infringe copyright or other rights of third parties;</li>
          <li>
            contain malware or are used to attack other systems or people;
          </li>
          <li>
            are used to deceive others (phishing, fraud) or violate
            someone&apos;s privacy.
          </li>
        </ul>
        <p>
          You are responsible for your files and for who you share their links
          with. Anyone with a file link can open the file (see the Privacy
          Policy).
        </p>
      </LegalSection>

      <LegalSection id="report" title="4. Reporting illegal content">
        <p>
          If you believe a file stored in Bojko Drive is illegal, send a notice
          to <strong className="text-foreground">{CONTROLLER.email}</strong>{" "}
          (Article 16 of the Digital Services Act). Please include:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>an explanation of why you consider the content illegal;</li>
          <li>
            the exact location of the content, such as the full link to the
            file;
          </li>
          <li>
            your name and e-mail address (not needed for reports of child sexual
            abuse material);
          </li>
          <li>
            a statement that you believe in good faith that the information in
            the notice is accurate and complete.
          </li>
        </ul>
        <p>
          We confirm receipt, assess the notice carefully and without undue
          delay, and tell you what we decided. If we remove content or suspend
          an account, we tell the affected user why and how to object (Article
          17 DSA). If you disagree with our decision you can contact us again or
          turn to the competent authority or a court.
        </p>
      </LegalSection>

      <LegalSection title="5. Suspension and termination">
        <p>
          If an account breaches these terms or the law, we may remove the
          content concerned, suspend the account or delete it. Where possible we
          warn you first and always give the reason. Illegal content may be
          reported to the authorities.
        </p>
      </LegalSection>

      <LegalSection title="6. Availability and liability">
        <p>
          Bojko Drive is a small project run in spare time. It is provided
          &quot;as is&quot; without a guarantee of uninterrupted operation, and
          it is not a backup service: keep copies of anything you cannot afford
          to lose. To the extent permitted by law we are not liable for losses
          caused by outages or data loss. This does not limit liability that
          cannot be excluded by law (for example liability for intentional
          damage or damage to health) or your rights as a consumer.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes, law and disputes">
        <p>
          We may update these terms; the date of the latest version is shown at
          the top, and for significant changes we will inform you in the
          service. Continued use after a change means you accept it.
        </p>
        <p>
          These terms are governed by Czech law. This does not take away
          mandatory consumer protection of the country where you live. If you
          are a consumer and we cannot settle a dispute, you can use
          out-of-court resolution through the Czech Trade Inspection Authority
          (Česká obchodní inspekce,{" "}
          <a
            href="https://www.coi.cz"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            www.coi.cz
          </a>
          ), or go to court.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

import { type Metadata } from "next";
import { LegalPage, LegalSection } from "~/components/legal-page";
import { ACCESSIBILITY_UPDATED, CONTROLLER } from "~/lib/legal";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "How accessible Bojko Drive is, known limitations and how to report a problem.",
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" updated={ACCESSIBILITY_UPDATED}>
      <p className="text-muted-foreground mt-6 leading-relaxed">
        We want Bojko Drive to be usable by as many people as possible,
        including people who use a keyboard, a screen reader, magnification or
        other assistive technology. We aim for the Web Content Accessibility
        Guidelines (WCAG) 2.2 at level AA, which is also the basis of the
        European standard EN 301 549.
      </p>

      <LegalSection title="1. Conformance status">
        <p>
          Bojko Drive{" "}
          <strong className="text-foreground">partially conforms</strong> to
          WCAG 2.2 level AA. This is our own assessment, based on code review
          and testing during development. The site has not been audited by an
          external body.
        </p>
      </LegalSection>

      <LegalSection title="2. What we do">
        <ul className="list-disc space-y-1 pl-6">
          <li>
            The main functions (signing in, browsing, uploading, renaming,
            moving, deleting and previewing files) can be used with a keyboard.
          </li>
          <li>
            A &quot;Skip to main content&quot; link and page landmarks help to
            move around the site.
          </li>
          <li>
            Every page has a descriptive title and the language is declared.
          </li>
          <li>
            Buttons, checkboxes and form fields have text labels; icons are
            decorative or have a text alternative.
          </li>
          <li>
            Keyboard focus is visible on interactive elements, and dialogs keep
            focus inside them until they are closed.
          </li>
          <li>
            Text has high contrast and the layout scales with the browser zoom
            and the text size setting.
          </li>
          <li>
            Animations are reduced when your system asks for reduced motion.
          </li>
          <li>
            Moving files and folders is possible without dragging, with the
            &quot;Move to…&quot; command.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Known limitations">
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong className="text-foreground">Your own files.</strong> Images,
            videos, audio, documents and other files you upload are shown as
            they are. We cannot add captions, transcripts or text alternatives
            to files we do not create.
          </li>
          <li>
            <strong className="text-foreground">Document previews.</strong>{" "}
            Office documents and PDFs are displayed by the browser or by a
            third-party viewer library, whose accessibility we cannot fully
            control. The file can always be opened or downloaded in your own
            application.
          </li>
          <li>
            <strong className="text-foreground">Third-party components.</strong>{" "}
            The sign-in and account windows (Clerk) and the upload button
            (UploadThing) are provided by third parties.
          </li>
          <li>
            We have not yet tested the site with every combination of browser
            and screen reader.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Feedback and contact">
        <p>
          If you run into an accessibility barrier, or you need information from
          the site in another form, write to{" "}
          <strong className="text-foreground">{CONTROLLER.email}</strong>.
          Please describe the problem, the page and the device, browser and
          assistive technology you use. We will reply within 30 days and try to
          fix the problem or offer another way to get what you need.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

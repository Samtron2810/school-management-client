import { Link } from "react-router-dom";
import { FaFileContract, FaArrowLeft } from "react-icons/fa";
import logo from "../../assets/logos/Tronschool-logo.png";

const LAST_UPDATED = "August 2026";
const CONTACT_EMAIL = "legal@tronschool.com";
const SCHOOL_NAME = "TronSchool";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-primary mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div className="text-sm text-slate-gray leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-accent-light">
      {/* Header */}
      <div className="bg-sidebar">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TronSchool" className="h-8 w-auto brightness-0 invert" />
            <span className="text-white font-semibold text-sm tracking-wide">
              Tron<span className="text-coral">School</span>
            </span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            Back to sign in
          </Link>
        </div>
      </div>

      {/* Page title */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent-light rounded-lg shrink-0">
              <FaFileContract className="text-accent text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Terms of Service</h1>
              <p className="text-sm text-slate-gray mt-1">
                Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">

          <p className="text-sm text-slate-gray leading-relaxed mb-10">
            These Terms of Service ("Terms") govern your access to and use of{" "}
            <strong className="text-primary">{SCHOOL_NAME}</strong> ("the platform",
            "we", "us"). By accessing or using the platform, you agree to be bound by
            these Terms. If you do not agree, do not use the platform.
          </p>

          <Section title="1. Eligibility and Account Creation">
            <p>
              Access to {SCHOOL_NAME} is granted exclusively by authorised school
              administrators. You may not self-register. Accounts are created for:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong className="text-primary">Administrators</strong> — full platform
                management access.
              </li>
              <li>
                <strong className="text-primary">Teachers</strong> — class, attendance,
                assessment, and result management.
              </li>
              <li>
                <strong className="text-primary">Students</strong> — read access to their
                own academic records and assessments.
              </li>
              <li>
                <strong className="text-primary">Parents/Guardians</strong> — read access to
                their linked child's records.
              </li>
            </ul>
            <p>
              You are responsible for keeping your credentials confidential. You must notify
              your School administrator immediately if you suspect unauthorised access to your
              account.
            </p>
          </Section>

          <Section title="2. Acceptable Use">
            <p>You agree to use {SCHOOL_NAME} only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Access, tamper with, or use accounts, data, or systems that do not belong to
                you.
              </li>
              <li>
                Attempt to reverse-engineer, decompile, or exploit the platform or its
                underlying infrastructure.
              </li>
              <li>
                Upload or transmit malicious code, viruses, or any content intended to damage
                the platform or its users.
              </li>
              <li>
                Use the platform to harass, threaten, or harm any user, student, or staff
                member.
              </li>
              <li>
                Share your login credentials with any other person or allow third-party access
                to your account.
              </li>
              <li>
                Scrape, bulk-download, or systematically extract data from the platform
                without written authorisation.
              </li>
            </ul>
          </Section>

          <Section title="3. Data Ownership">
            <p>
              All student records, attendance data, assessment content, and academic reports
              entered into {SCHOOL_NAME} remain the property of the School institution that
              operates the account. {SCHOOL_NAME} acts as a data processor on the School's
              behalf.
            </p>
            <p>
              You retain ownership of any original content you create (e.g. lesson plans,
              question bank items). By uploading content, you grant {SCHOOL_NAME} a limited
              licence to store and display that content to authorised users within your School.
            </p>
          </Section>

          <Section title="4. Service Availability">
            <p>
              We aim to provide a reliable, continuously available service, but we do not
              guarantee 100% uptime. We may perform scheduled or emergency maintenance that
              temporarily makes the platform unavailable.
            </p>
            <p>
              We are not liable for any loss arising from platform downtime, data
              unavailability, or interruptions beyond our reasonable control (including
              third-party infrastructure failures).
            </p>
          </Section>

          <Section title="5. Suspension and Termination">
            <p>
              We reserve the right to suspend or terminate access to the platform — with or
              without notice — if:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>You violate these Terms or our Privacy Policy.</li>
              <li>
                Your School institution's subscription lapses or is terminated.
              </li>
              <li>
                We reasonably believe your account or activity poses a security risk to the
                platform or other users.
              </li>
            </ul>
            <p>
              Upon termination, your access to the platform will cease. Data export requests
              must be submitted before account closure.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, {SCHOOL_NAME} shall not be
              liable for:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Any indirect, incidental, consequential, or punitive damages arising from your
                use of the platform.
              </li>
              <li>
                Loss of data resulting from user error, misuse, or events outside our
                reasonable control.
              </li>
              <li>
                Academic decisions made by school staff based on data recorded in the platform.
              </li>
            </ul>
            <p>
              Our total liability for any claim shall not exceed the fees paid by the School
              institution in the 3 months preceding the claim.
            </p>
          </Section>

          <Section title="7. Privacy">
            <p>
              Your use of {SCHOOL_NAME} is also governed by our{" "}
              <Link to="/privacy" className="text-coral hover:underline font-medium">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the platform,
              you consent to the data practices described therein.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The {SCHOOL_NAME} platform, including its design, code, branding, and
              documentation, is our exclusive intellectual property. Nothing in these Terms
              transfers any ownership of our intellectual property to you.
            </p>
            <p>
              You may not copy, reproduce, distribute, or create derivative works from any
              part of the platform without our prior written consent.
            </p>
          </Section>

          <Section title="9. Modifications to These Terms">
            <p>
              We may update these Terms from time to time. When we do, the "Last updated"
              date at the top of this page will change. Continued use of the platform after
              updates are published constitutes your acceptance of the revised Terms.
            </p>
            <p>
              For material changes, we will make reasonable efforts to notify School
              administrators via the platform's announcement system.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the
              Federal Republic of Nigeria. Any disputes arising under these Terms shall be
              subject to the exclusive jurisdiction of the Nigerian courts.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-coral hover:underline font-medium"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex items-center justify-between text-xs text-slate-gray">
          <span>&copy; {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.</span>
          <Link to="/privacy" className="text-coral hover:underline">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}

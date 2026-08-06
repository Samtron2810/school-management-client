import { Link } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import logo from "../../assets/logos/Tronschool-logo.png";

const LAST_UPDATED = "August 2026";
const CONTACT_EMAIL = "privacy@tronschool.com";
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

export default function PrivacyPolicyPage() {
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
              <FaShieldAlt className="text-accent text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Privacy Policy</h1>
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
            This Privacy Policy explains how <strong className="text-primary">{SCHOOL_NAME}</strong>{" "}
            ("we", "our", or "the platform") collects, uses, stores, and protects personal
            information when you use our school management system. By using {SCHOOL_NAME}, you
            agree to the practices described here.
          </p>

          <Section title="1. Who We Are">
            <p>
              {SCHOOL_NAME} is a school management platform used by educational institutions
              to manage student records, attendance, assessments, results, and communications.
              The platform is operated on behalf of the subscribing school institution (the
              "School"), which acts as the data controller for its users' personal data.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong className="text-primary">Identity data:</strong> First name, last name,
                other names, username, admission number, and date of birth.
              </li>
              <li>
                <strong className="text-primary">Contact data:</strong> Email address and phone
                number.
              </li>
              <li>
                <strong className="text-primary">Academic data:</strong> Class assignments,
                subject enrolments, attendance records, assessment scores, results, report
                cards, and lesson plans.
              </li>
              <li>
                <strong className="text-primary">Relationship data:</strong> Parent–student
                linkages recorded by school administrators.
              </li>
              <li>
                <strong className="text-primary">Account data:</strong> Role, account status,
                last login time, and password (stored as a one-way hash — never in plain text).
              </li>
              <li>
                <strong className="text-primary">Technical data:</strong> IP address, browser
                type, and access logs generated during normal platform use.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use personal data to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Operate and maintain user accounts and school records.</li>
              <li>Track attendance, assessments, and academic performance.</li>
              <li>Generate report cards and academic summaries.</li>
              <li>Send transactional emails (e.g. password reset links).</li>
              <li>Deliver school-wide announcements to relevant users.</li>
              <li>Ensure platform security, prevent fraud, and enforce our Terms of Service.</li>
            </ul>
            <p>
              We do not use personal data for advertising or share it with third parties for
              marketing purposes.
            </p>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>
              We process personal data on the following legal grounds under the Nigeria Data
              Protection Act (NDPA) 2023 and applicable international frameworks:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong className="text-primary">Contractual necessity:</strong> Processing
                required to operate the school management service.
              </li>
              <li>
                <strong className="text-primary">Legitimate interests:</strong> Platform
                security, audit logging, and system integrity.
              </li>
              <li>
                <strong className="text-primary">Legal obligation:</strong> Retaining records
                as required by Nigerian educational regulations.
              </li>
              <li>
                <strong className="text-primary">Consent:</strong> Where explicitly obtained,
                particularly for data relating to minors.
              </li>
            </ul>
          </Section>

          <Section title="5. Data Relating to Minors">
            <p>
              Student records frequently contain data about individuals under 18 years of age.
              We treat this data with heightened care:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Student accounts are created by authorised school administrators, not by
                students themselves.
              </li>
              <li>
                Parent/guardian accounts are linked to student records to facilitate oversight.
              </li>
              <li>
                We do not share student data with any third party without the explicit consent
                of the School and, where required, the parent or guardian.
              </li>
              <li>
                Parents may request a copy or deletion of their child's data by contacting the
                School administrator.
              </li>
            </ul>
          </Section>

          <Section title="6. Third-Party Services">
            <p>
              {SCHOOL_NAME} uses the following third-party processors. Each is bound by data
              processing agreements:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong className="text-primary">MongoDB Atlas</strong> — cloud database
                hosting (data stored in your configured Atlas region).
              </li>
              <li>
                <strong className="text-primary">Cloudinary</strong> — profile image and
                file storage.
              </li>
              <li>
                <strong className="text-primary">Brevo</strong> — transactional email delivery
                (password reset and account notifications only).
              </li>
            </ul>
            <p>
              We do not sell, rent, or trade personal data with any other third party.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain personal data for as long as necessary to provide the service and
              comply with legal obligations:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong className="text-primary">Active accounts:</strong> Retained for the
                duration of the user's relationship with the School.
              </li>
              <li>
                <strong className="text-primary">Student academic records:</strong> Retained
                for 7 years after a student's last academic session, in line with standard
                Nigerian educational record-keeping requirements.
              </li>
              <li>
                <strong className="text-primary">Access logs:</strong> Retained for 90 days
                on a rolling basis.
              </li>
              <li>
                <strong className="text-primary">Deleted accounts:</strong> Soft-deleted and
                fully purged after 30 days.
              </li>
            </ul>
          </Section>

          <Section title="8. Security">
            <p>
              We apply industry-standard technical and organisational safeguards, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Passwords hashed with bcrypt (salt rounds 12) — never stored in plain text.</li>
              <li>All data in transit encrypted via HTTPS/TLS.</li>
              <li>
                Authentication via short-lived JWT access tokens and rotated refresh tokens
                with Redis-backed blacklisting.
              </li>
              <li>Role-based access controls enforced on every API endpoint.</li>
              <li>Input sanitisation against XSS and NoSQL injection on every request.</li>
            </ul>
            <p>
              No system is 100% secure. If you believe your account has been compromised,
              contact your School administrator immediately.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access a copy of the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (subject to legal retention requirements).</li>
              <li>Object to or restrict certain types of processing.</li>
              <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC).</li>
            </ul>
            <p>
              To exercise any of these rights, contact your School administrator or email us
              at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-coral hover:underline font-medium"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, the "Last
              updated" date at the top of this page will change. Continued use of the platform
              after changes are published constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions or concerns about this Privacy Policy? Reach us at{" "}
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
          <Link to="/terms" className="text-coral hover:underline">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}

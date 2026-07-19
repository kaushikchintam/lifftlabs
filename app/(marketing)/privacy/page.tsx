/**
 * SC-03 — Privacy policy. DRAFT: reviewed for factual accuracy against the
 * codebase, but have it checked by a solicitor before public launch, and
 * keep the Google Calendar section consistent with the OAuth consent screen.
 * URL: /privacy
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12 text-sm leading-relaxed">
      <h1 className="font-serif text-3xl">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: 14 July 2026 — DRAFT</p>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Who we are</h2>
        <p>
          LIFFT Labs ("LIFFT", "we") operates a mentoring platform connecting
          people exploring healthcare careers with experienced mentors. We are
          the data controller for the personal data described here. Contact:
          privacy@lifftlabs.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">What we collect and why</h2>
        <p>
          <strong>Account data</strong> — name, email, and password (stored
          hashed), to operate your account. <strong>Profile data</strong> —
          the professional background, goals, and preferences you provide
          during onboarding, to run the mentoring service.{" "}
          <strong>Session data</strong> — bookings, session times, and
          statuses. <strong>Messages</strong> — messages you exchange with
          your mentor or learner through the platform.{" "}
          <strong>Payment records</strong> — amounts, dates, and references
          for payments (see Stripe below — we never hold card or bank
          details).
        </p>
        <p>
          Our lawful bases are performance of our contract with you and, for
          service emails and fraud/abuse prevention, legitimate interests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Google Calendar</h2>
        <p>
          If you are a mentor and choose to connect Google Calendar, we
          request permission to view and manage events on your calendar. We
          use this to: (1) read the <em>times</em> you are busy so learners
          cannot book over your commitments — we store start and end times
          only, never event titles, descriptions, attendees, or any other
          event content; and (2) add, update, or remove calendar events for
          confirmed LIFFT sessions. You can disconnect at any time from your
          calendar settings or your Google account security page, which stops
          all access. LIFFT's use of information received from Google APIs
          adheres to the Google API Services User Data Policy, including the
          Limited Use requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Video sessions</h2>
        <p>
          Video calls run on Agora's real-time infrastructure. Sessions are
          <strong> not recorded</strong> by LIFFT. Agora processes the
          audio/video streams to deliver the call.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Our processors</h2>
        <p>
          Supabase (database hosting, EU region — eu-west-1); Stripe (payments
          and mentor payouts — card and bank details are collected and held by
          Stripe, never by LIFFT); Agora (video calls); Resend (transactional
          email); Vercel (application hosting). Each processes data under
          their own data processing terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Retention and deletion</h2>
        <p>
          We keep your data while your account is active. On a deletion
          request we remove or anonymise your personal data across our
          systems, except records we must keep for legal reasons (e.g.
          payment records for tax purposes, retained in anonymised form where
          possible). To request deletion, email privacy@lifftlabs.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Your rights</h2>
        <p>
          Under UK GDPR you can request access to, correction of, or deletion
          of your personal data, object to or restrict processing, and
          request portability. You can complain to the Information
          Commissioner's Office (ico.org.uk). We are registered with the ICO.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Cookies and analytics</h2>
        <p>
          We use strictly necessary cookies for signing in. Analytics
          (PostHog, hosted in the EU) run only with your consent, given via
          the cookie banner, and can be declined without affecting the
          service.
        </p>
      </section>
    </div>
  );
}
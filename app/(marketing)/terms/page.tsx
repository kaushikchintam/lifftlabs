/**
 * SC-03 — Terms of service, including the cancellation/refund policy the
 * payments phase requires. DRAFT: the policy numbers below (24h threshold,
 * full refund) are sensible defaults — confirm them as a founder decision
 * and have the document reviewed by a solicitor before real payments.
 * URL: /terms
 */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12 text-sm leading-relaxed">
      <h1 className="font-serif text-3xl">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: 14 July 2026 — DRAFT</p>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">The service</h2>
        <p>
          LIFFT connects learners with mentors for paid one-to-one career
          mentoring sessions. Mentors are independent professionals, not
          employees of LIFFT. Mentoring is career guidance based on personal
          experience — it is not medical, legal, or financial advice, and no
          outcome (such as admission or employment) is guaranteed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Booking and payment</h2>
        <p>
          Sessions are booked by selecting a published time slot and paying in
          full at booking through Stripe. Prices are shown in GBP and include
          LIFFT's platform fee. A booking is confirmed when payment completes;
          a slot held during checkout is released automatically if payment is
          not completed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Cancellations and refunds</h2>
        <p>
          <strong>Cancelling as a learner:</strong> cancel 24 hours or more
          before the session start for a full refund. Cancellations within 24
          hours of the start time are not refunded, as the mentor has reserved
          that time.
        </p>
        <p>
          <strong>If your mentor cancels</strong> (at any notice), you receive
          a full refund, or you may rebook at no charge.
        </p>
        <p>
          <strong>Technical failure:</strong> if a session cannot take place
          because of a fault with LIFFT, you receive a full refund or a free
          rebooking, your choice.
        </p>
        <p>
          Refunds are returned to the original payment method and typically
          appear within 5–10 working days. To cancel, use your session page or
          email support@lifftlabs.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Conduct</h2>
        <p>
          Sessions and messages must remain professional and respectful. We
          may suspend accounts that abuse other users or the platform. Do not
          share confidential patient information in sessions or messages.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Mentors</h2>
        <p>
          Mentors receive payouts through Stripe Connect and are responsible
          for their own tax affairs, including declaring self-employment
          income to HMRC where applicable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Liability and law</h2>
        <p>
          Nothing in these terms limits liability that cannot be limited under
          law. Otherwise, LIFFT's liability in connection with a session is
          limited to the amount paid for that session. These terms are
          governed by the law of England and Wales.
        </p>
      </section>
    </div>
  );
}
import Link from "next/link";

/** About — /about. Server component; the marketing layout provides nav + footer. */

export const metadata = {
  title: "About — LIFFT Labs",
  description:
    "Why LIFFT exists: mentorship for people retraining into medicine and advancing within it.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-[#DDEBF3] px-6 py-24 text-center">
        <h1 className="font-archivo-black text-4xl text-[#18150F] max-w-2xl mx-auto leading-tight mb-6">
          Career changes shouldn't depend on who you happen to know.
        </h1>
        <p className="font-dm-sans text-[#3A372F] text-lg max-w-xl mx-auto leading-relaxed">
          LIFFT connects people retraining into medicine — and moving up
          within it — with mentors who've already made the journey.
        </p>
      </section>

      {/* Why */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="font-archivo-black text-2xl text-[#18150F]">
            Why we built this
          </h2>
          <p className="font-dm-sans text-[#3A372F] leading-relaxed">
            Every year, thousands of capable people consider a move into
            medicine — from other careers, from allied health roles, from
            everywhere. The information exists, scattered across forums and
            official pages. What's missing is a person: someone who sat where
            you're sitting, made the decision, and can tell you honestly what
            it took.
          </p>
          <p className="font-dm-sans text-[#3A372F] leading-relaxed">
            Those conversations happen today — but mostly through luck.
            A friend of a friend. A generous colleague. If your network
            doesn't include the right person, the path is harder for no good
            reason. LIFFT makes that conversation bookable.
          </p>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-[#FBF7EE] px-6 py-20">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="font-archivo-black text-2xl text-[#18150F]">
            How we work
          </h2>
          <div className="space-y-5">
            {[
              {
                title: "Real mentors, reviewed individually",
                body: "Every mentor on LIFFT applies and is reviewed before they can take a single session. Quality over quantity — deliberately.",
              },
              {
                title: "Their real availability",
                body: "Mentors' calendars stay in sync, so the times you see are times they can actually make. We only ever see when they're busy — never the contents of their calendar.",
              },
              {
                title: "Privacy first",
                body: "Career conversations can be personal. Sessions aren't recorded, messages stay between you and your mentor, and your data is handled under UK GDPR.",
              },
            ].map(({ title, body }) => (
              <div key={title}>
                <h3 className="font-archivo-black text-base text-[#18150F] mb-1">
                  {title}
                </h3>
                <p className="font-dm-sans text-sm text-[#3A372F] leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early stage honesty + CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="font-archivo-black text-2xl text-[#18150F]">
            We're just getting started
          </h2>
          <p className="font-dm-sans text-[#3A372F] leading-relaxed">
            LIFFT is young, and early access is deliberately small — a
            hand-picked group of mentors and learners while we get every
            detail right. If that sounds like something you want to be part
            of, we'd love to hear from you.
          </p>
          <p className="font-dm-sans text-sm text-[#6F6B60]">
            Questions? Write to{" "}
            <a
              href="mailto:hello@lifftlabs.com"
              className="text-[#2596BE] underline underline-offset-2"
            >
              hello@lifftlabs.com
            </a>{" "}
            — a founder reads every email.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#2596BE] hover:bg-[#1A7A9E] text-white font-archivo-black rounded-full px-8 py-3 text-base transition-colors"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
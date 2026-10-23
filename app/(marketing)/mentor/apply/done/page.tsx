import Link from "next/link";

export const metadata = { title: "Application received" };

export default function ApplicationDonePage() {
  return (
    <div className="bg-lf-page px-4 py-20 text-lf-ink">
      <div className="mx-auto max-w-[640px]">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Thanks — we&apos;ve got your application</h1>
        <p className="mb-8 text-lg text-lf-body">
          The LIFFT team reviews every application by hand: identity, registration or qualifications, insurance and
          references. If you&apos;re approved, we&apos;ll email you a link to set up payouts and your weekly hours.
        </p>
        <Link href="/" className="text-lf-ink underline">Back to LIFFT</Link>
      </div>
    </div>
  );
}

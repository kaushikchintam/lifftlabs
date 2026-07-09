import Link from "next/link";

export default function MentorAppliedPage() {
  return (
    <div className="min-h-screen bg-[#F1ECE0] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">LIFFT LABS</span>

        <h1 className="font-dm-serif text-5xl text-[#18150F] leading-tight mt-8 mb-4">
          We&apos;ll be in touch.
        </h1>

        <p className="font-dm-sans text-[#6F6B60] text-base mb-10">
          Your application is with us. We review every coach by hand and aim to respond within 48 hours.
        </p>

        <Link
          href="/"
          className="font-dm-sans text-sm text-[#2596BE] hover:underline"
        >
          Back to home
        </Link>

      </div>
    </div>
  );
}

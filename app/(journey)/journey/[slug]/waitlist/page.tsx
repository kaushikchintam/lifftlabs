import { notFound } from "next/navigation";
import { answersFromParams, answersToQuery, getJourney } from "@/features/journeys/config";
import { StepHeader } from "@/features/journeys/components/step-header";
import { WaitlistForm } from "@/features/journeys/components/waitlist-form";
import { getServerSession } from "@/lib/auth/session";

export default async function WaitlistPage(props: PageProps<"/journey/[slug]/waitlist">) {
  const { slug } = await props.params;
  const journey = getJourney(slug);
  if (!journey) notFound();

  const answers = answersFromParams(journey, await props.searchParams);
  const session = await getServerSession();

  return (
    <>
      <StepHeader journey={journey} backHref={`/journey/${slug}?${answersToQuery(answers)}`} />
      <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">We&apos;re vetting new mentors for you</h1>
      <p className="mb-8 max-w-[760px] text-xl text-lf-body">
        There&apos;s no {journey.title.toLowerCase()} mentor ready yet. Leave your email and we&apos;ll tell you the
        moment there is. We&apos;ll keep your answers so you won&apos;t start again.
      </p>
      <WaitlistForm journey={journey.slug} answers={answers} defaultEmail={session?.user.email ?? ""} />
    </>
  );
}

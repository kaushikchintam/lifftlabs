import { notFound } from "next/navigation";
import { answersFromParams, getJourney } from "@/features/journeys/config";
import { StepHeader } from "@/features/journeys/components/step-header";
import { IntakeForm } from "@/features/journeys/components/intake-form";
import { logFunnel } from "@/lib/funnel";
import { getServerSession } from "@/lib/auth/session";

export default async function IntakePage(props: PageProps<"/journey/[slug]">) {
  const { slug } = await props.params;
  const journey = getJourney(slug);
  if (!journey) notFound();

  await logFunnel("chose_journey", journey.slug);
  const initial = answersFromParams(journey, await props.searchParams);
  const session = await getServerSession();

  return (
    <>
      <StepHeader journey={journey} step={1} backHref="/" />
      <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">{journey.heading}</h1>
      {journey.subheading && <p className="mb-8 text-xl text-lf-body">{journey.subheading}</p>}
      <div className={journey.subheading ? "" : "mt-8"}>
        <IntakeForm slug={journey.slug} initial={initial} signedIn={!!session?.user.emailVerified} />
      </div>
    </>
  );
}

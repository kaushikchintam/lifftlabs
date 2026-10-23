import { notFound, redirect } from "next/navigation";
import { answersFromParams, answersToQuery, getJourney, isComplete } from "@/features/journeys/config";
import { StepHeader } from "@/features/journeys/components/step-header";
import { AccountStep } from "@/features/journeys/components/account-step";
import { getServerSession } from "@/lib/auth/session";
import { logFunnel } from "@/lib/funnel";

export default async function AccountPage(props: PageProps<"/journey/[slug]/account">) {
  const { slug } = await props.params;
  const journey = getJourney(slug);
  if (!journey) notFound();

  const answers = answersFromParams(journey, await props.searchParams);
  const intakePath = `/journey/${slug}?${answersToQuery(answers)}`;
  if (!isComplete(journey, answers)) redirect(intakePath);

  // Verified users don't need this step; the intake form saves for them.
  const session = await getServerSession();
  if (session?.user.emailVerified) redirect(intakePath);

  await logFunnel("intake", journey.slug);

  return (
    <>
      <StepHeader journey={journey} step={2} backHref={intakePath} />
      <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">Create your account</h1>
      <p className="mb-8 text-xl text-lf-body">
        Then you&apos;ll see every mentor on LIFFT, with the ones who match your answers first.
      </p>
      <AccountStep
        journey={journey.slug}
        answers={answers}
        signedInEmail={session?.user.email ?? null}
        loginHref={`/login?returnTo=${encodeURIComponent(intakePath)}`}
      />
    </>
  );
}

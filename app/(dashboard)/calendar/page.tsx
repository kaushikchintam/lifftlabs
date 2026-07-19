import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlotPublisher } from "@/features/calendar/components/slot-publisher";
import { BlockerWeek } from "@/features/calendar/components/blocker-week";
import { SyncButton } from "@/features/calendar/components/sync-button";

/**
 * Mentor calendar page - (the OAuth callback's landing)
 *
 * Three states:
 *     not connected -> explain + Connect button (links the kickoff route)
 *     revoked -> reconnect banner (invalid_grant was detected by sync)
 *     active -> busy-times summary + slot publishing
 *
 * Learners have no business here: no mentor_profiles row -> redirect home.
 */

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const { data: mentor } = await supabaseAdmin
      .from("mentor_profiles")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!mentor) redirect("/dashboard");

    const { data: integration } = await supabaseAdmin
      .from("calendar_integrations")
      .select("status, updated_at, channel_expiry")
      .eq("mentor_id", session.user.id)
      .eq("provider", "google")
      .maybeSingle();

    const { error } = await searchParams;
    const callbackError =
      error === "missing_params" || error === "oauth_timeout"
        ? "Connecting didn't complete - please try again."
        : null;

    const connected = integration?.status === "active";
    const revoked = integration?.status === "revoked";

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <span className="mb-3 inline-flex rounded-full border border-[#E8E2D6] bg-[#FBF7EE] px-3 py-1 font-dm-sans text-xs font-semibold uppercase tracking-wide text-[#6F6B60]">
          Calendar
        </span>
        <h1 className="font-dm-serif text-4xl font-normal tracking-tight text-[#18150F]">
          Calendar
        </h1>
        <p className="mt-1 font-dm-sans text-[15px] leading-relaxed text-[#6F6B60]">
          Connect Google Calendar so LIFFT knows when you&apos;re busy, then
          publish the times you&apos;re open to mentoring.
        </p>
      </header>

      {callbackError && (
        <p className="rounded-xl border border-[#E8E2D6] bg-[#F8E9E4] px-4 py-3 font-dm-sans text-sm text-[#8C3B22]">
          {callbackError}
        </p>
      )}

      {!connected ? (
        <div className="space-y-4 rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-[#E8E2D6]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </span>
            <div>
              <h2 className="font-dm-serif text-xl text-[#18150F]">
                {revoked ? "Reconnect your calendar" : "Connect Google Calendar"}
              </h2>
              <p className="mt-1 font-dm-sans text-sm leading-relaxed text-[#6F6B60]">
                {revoked
                  ? "Access was revoked or expired, so your availability has stopped updating. Reconnect to resume."
                  : "We only read when you're busy and add your confirmed LIFFT sessions — event details stay private."}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="rounded-full bg-[#18150F] px-5 font-dm-sans font-semibold text-[#FBF7EE] hover:bg-[#3A372F]"
          >
            <a href="/api/auth/google-calendar">
              {revoked ? "Reconnect calendar" : "Connect Google Calendar"}
            </a>
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-6 shadow-sm">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h2 className="font-dm-serif text-2xl text-[#18150F]">
                Your busy times
              </h2>
              <SyncButton />
            </div>
            <p className="mb-5 font-dm-sans text-sm leading-relaxed text-[#6F6B60]">
              Pulled from Google Calendar. Slots that clash with these are
              rejected — and if a clash appears later, the slot is withdrawn
              automatically.
            </p>
            <BlockerWeek />
          </div>

          <SlotPublisher />
        </>
      )}
    </div>
  );
}
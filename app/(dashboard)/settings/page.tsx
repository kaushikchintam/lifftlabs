import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentStage } from "@/lib/stage";
import { SettingsBoard } from "@/features/settings/components/settings-board";

/** Settings — /settings. Role-aware: mentors get payout management under
 *  Payments; learners get their subscription status there and a Stage
 *  switcher under Account. */

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id, stripe_account_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const role: "mentor" | "learner" = mentor ? "mentor" : "learner";

  const rawStage = role === "learner" ? await getCurrentStage(session.user.id) : null;
  const currentStage =
    rawStage === "applicant" || rawStage === "med_student" || rawStage === "resident" ? rawStage : null;

  let subscription: { status: string | null; currentPeriodEnd: string | null } = {
    status: null,
    currentPeriodEnd: null,
  };

  if (role === "learner") {
    const { data } = await supabaseAdmin
      .from("learner_profiles")
      .select("subscription_status, current_period_end")
      .eq("user_id", session.user.id)
      .maybeSingle();

    subscription = {
      status: data?.subscription_status ?? null,
      currentPeriodEnd: data?.current_period_end ?? null,
    };
  }

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <h2 className="font-dm-serif text-5xl text-ink mb-2">Settings</h2>
      </div>

      <SettingsBoard
        role={role}
        hasStripeAccount={!!mentor?.stripe_account_id}
        currentStage={currentStage}
        subscription={subscription}
      />
    </div>
  );
}
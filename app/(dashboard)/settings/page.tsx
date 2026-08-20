import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentStage } from "@/lib/stage";
import { SettingsBoard } from "@/features/settings/components/settings-board";

/** Settings — /settings. Role-aware: mentors get payout management under
 *  Payments; learners get payment history there and a Stage switcher under
 *  Account. */

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

  let payments: {
    id: string;
    amount_pence: number;
    created_at: string;
    session_id: string | null;
    mentor_name: string | null;
  }[] = [];

  if (role === "learner") {
    const { data } = await supabaseAdmin
      .from("payments")
      .select(
        `id, amount_pence, created_at, session_id,
         session:mentor_sessions(mentor:user!mentor_sessions_mentor_id_fkey(name))`
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    payments = ((data ?? []) as unknown as {
      id: string;
      amount_pence: number;
      created_at: string;
      session_id: string | null;
      session: { mentor: { name: string } | null } | null;
    }[]).map((p) => ({
      id: p.id,
      amount_pence: p.amount_pence,
      created_at: p.created_at,
      session_id: p.session_id,
      mentor_name: p.session?.mentor?.name ?? null,
    }));
  }

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <h2 className="font-dm-serif text-5xl text-ink mb-2">Settings</h2>
      </div>

      <SettingsBoard role={role} hasStripeAccount={!!mentor?.stripe_account_id} currentStage={currentStage} payments={payments} />
    </div>
  );
}
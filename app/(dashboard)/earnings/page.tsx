import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
/**
 * Earnings — mentor side (P4-04). URL: /earnings
 *
 * Figures here are indicative (gross, and net after LIFFT's platform fee).
 * Exact payout amounts, Stripe's processing fees, and payout timing live in
 * the mentor's Stripe Express Dashboard — the authoritative source.
 */

const PLATFORM_FEE_PERCENT = 15; // keep in step with app/api/sessions/route.ts

interface EarningRow {
  id: string;
  amount_pence: number;
  status: string;
  created_at: string;
  session: {
    mentor_id: string;
    scheduled_at: string;
    learner: { name: string } | null;
  } | null;
}

export default async function EarningsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (!mentor) redirect("/dashboard");

  const { data } = await supabaseAdmin
    .from("payments")
    .select(
      `id, amount_pence, status, created_at,
       session:mentor_sessions!inner(
         mentor_id, scheduled_at,
         learner:user!mentor_sessions_learner_id_fkey(name)
       )`
    )
    .eq("session.mentor_id", session.user.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false });

  const earnings = (data ?? []) as unknown as EarningRow[];

  const grossPence = earnings.reduce((sum, e) => sum + e.amount_pence, 0);
  const netPence = Math.round(grossPence * (1 - PLATFORM_FEE_PERCENT / 100));

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <h1 className="font-archivo-black text-2xl text-[#18150F] tracking-widest uppercase">Earnings</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-5 shadow-sm">
          <p className="font-dm-sans text-xs uppercase tracking-widest text-[#9A958A]">
            Sessions paid
          </p>
          <p className="font-dm-serif text-3xl text-[#18150F] mt-1">{earnings.length}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-5 shadow-sm">
          <p className="font-dm-sans text-xs uppercase tracking-widest text-[#9A958A]">
            Your share (after {PLATFORM_FEE_PERCENT}% platform fee)
          </p>
          <p className="font-dm-serif text-3xl text-[#18150F] mt-1">£{(netPence / 100).toFixed(2)}</p>
        </div>
      </div>

      <p className="font-dm-sans text-xs text-[#6F6B60]">
        Exact payout amounts and timing are in your Stripe dashboard — Stripe's
        processing fees are deducted there, and the first payout on a new
        account is typically held around 7 days.
      </p>

      {earnings.length === 0 ? (
        <p className="font-dm-sans text-sm text-[#6F6B60]">
          No paid sessions yet. Once a learner books and pays, it appears here.
        </p>
      ) : (
        <div className="space-y-3">
          {earnings.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] px-5 py-4 shadow-sm">
              <div>
                <p className="font-dm-sans font-semibold text-[#18150F]">
                  Session with {e.session?.learner?.name ?? "—"}
                </p>
                <p className="font-dm-sans text-sm text-[#6F6B60] mt-0.5">
                  Paid {dateFmt.format(new Date(e.created_at))}
                </p>
              </div>
              <p className="font-dm-sans font-semibold text-[#2596BE]">
                £{(e.amount_pence / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
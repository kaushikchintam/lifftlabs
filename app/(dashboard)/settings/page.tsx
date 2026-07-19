import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SettingsForm } from "@/features/settings/components/settings-form";

/** Settings — /settings. Role-aware: mentors also get payout management. */

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id, stripe_account_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <h2 className="font-archivo-black text-5xl text-[#18150F] mb-2">
          Settings
        </h2>
        <p className="font-dm-sans text-lg text-[#6F6B60]">
          Your profile{mentor ? " and payouts" : ""}.
        </p>
      </div>

      <SettingsForm hasStripeAccount={!!mentor?.stripe_account_id} />
    </div>
  );
}
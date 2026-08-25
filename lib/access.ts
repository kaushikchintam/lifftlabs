import { supabaseAdmin } from "@/lib/supabase/admin";

const ACTIVE_STATUSES = new Set(["active", "canceling", "trialing"]);

/**
 * Mentors aren't the ones subscribing — they're paid via the platform's
 * revenue share, not a per-user charge — so their access is never gated.
 * Only learners need an active subscription.
 */
export async function hasPlatformAccess(userId: string): Promise<boolean> {
    const { data: mentor } = await supabaseAdmin
        .from("mentor_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (mentor) return true;

    const { data } = await supabaseAdmin
        .from("learner_profiles")
        .select("subscription_status, current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

    if (!data?.subscription_status || !ACTIVE_STATUSES.has(data.subscription_status)) {
        return false;
    }

    // "canceling" still has access through the period they already paid for.
    if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
        return false;
    }

    return true;
}

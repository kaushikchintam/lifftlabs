import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Mentor = has a mentor_profiles row. One query per request (memoized). */
export const roleOf = cache(async (userId: string): Promise<"mentor" | "learner"> => {
  const { data } = await supabaseAdmin.from("mentor_profiles").select("user_id").eq("user_id", userId).maybeSingle();
  return data ? "mentor" : "learner";
});

const PLUS_STATUSES = new Set(["active", "trialing", "canceling"]);

/** LIFFT Plus member: live subscription (a cancelled one runs to the end of the paid period). */
export const isPlus = cache(async (userId: string): Promise<boolean> => {
  const { data } = await supabaseAdmin
    .from("learner_profiles")
    .select("subscription_status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.subscription_status || !PLUS_STATUSES.has(data.subscription_status)) return false;
  return !data.current_period_end || new Date(data.current_period_end) > new Date();
});

/** The applicant tools (experience log, portfolio, reflection, resources) are for the medical-school journey only. */
export const hasMedSchoolTools = cache(async (userId: string): Promise<boolean> => {
  const { count } = await supabaseAdmin
    .from("intakes")
    .select("id", { count: "exact", head: true })
    .eq("learner_id", userId)
    .eq("journey", "medical-school");
  return (count ?? 0) > 0;
});

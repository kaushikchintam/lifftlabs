//getCurrentStage(userId), nudge threshold constants. 
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Stages } from "@/components/layout/nav-items";

export const STAGE_NUDGE_THRESHOLD_DAYS: Record<"applicant" |"med_student", number> = {
    applicant: 300,
    med_student: 5 * 365,
};

export async function getCurrentStage(userId: string): Promise<Stages | null> {
    const { data } = await supabaseAdmin
      .from("stage_transitions")
      .select("stage, effective_from")
      .eq("user_id", userId)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data?.stage ?? null;
}

export async function shouldNudgeStage(userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from("stage_transitions")
      .select("stage, effective_from")
      .eq("user_id", userId)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!data || data.stage === "resident" || data.stage === "mentor") return false;
    
    const thresholdDays = STAGE_NUDGE_THRESHOLD_DAYS[data.stage as "applicant" | "med_student"];
    const daysSince = (Date.now() - new Date(data.effective_from).getTime()) / 86_400_000;

    return daysSince >= thresholdDays;
}
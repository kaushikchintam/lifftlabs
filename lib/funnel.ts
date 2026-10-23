import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type FunnelStep = "chose_journey" | "intake" | "signed_up";

/** Top-of-funnel event, keyed by the anon_id cookie proxy.ts sets. Never throws. */
export async function logFunnel(step: FunnelStep, journey: string, userId?: string | null) {
  const anonId = (await cookies()).get("anon_id")?.value ?? null;
  const { error } = await supabaseAdmin
    .from("funnel_events")
    .insert({ step, journey, anon_id: anonId, user_id: userId ?? null });
  if (error) console.error("[funnel] insert failed:", error);
}

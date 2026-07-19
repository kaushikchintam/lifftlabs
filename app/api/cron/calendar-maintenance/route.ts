//the daily job: finds active integrations past renew_at, 
// renews each channel, then forceFullSync (the rolling-window fix). 
// Per-mentor try/catch so one failure doesn't block the rest; 
// invalid_grant marks the integration revoked instead of 
// retrying forever. Auth via CRON_SECRET — add that env var in 
// Vercel (any long random string); Vercel Cron then sends it 
// automatically as the Bearer token.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerWatchChannel } from "@/lib/calendar/watch";
import { forceFullSync } from "@/lib/calendar/sync";
import { 
    isInvalidGrantError, 
    markIntegrationRevoked,
} from "@/lib/calendar/client";

/**
 * Daily calendar maintenace (P3-06), triggered by Vercel Cron. 
 * 
 * For every active integration whose renew_at has passes:
 * 1. Re-register the watch channel (Google caps them at ~7 days;
 * renew_at sits at 50% lifetime, so daily runs have ~2.5 days slack).
 * 2. forceFullSync - discards the sync token and re-establishes a fresh
 * 60-day window. This is the rolling-windw fix: sync tokens freeze 
 * the timeMin/timeMax they were created with, so without periodic
 * full re-syncs the horizon never moves forward. 
 * 
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the 
 * CRON_SECRET env var is set. Manual trigger for testing: 
 * curl -H "Authorization: Bearer $CRON_SECRET" \
 *     http://localhost:3000/api/cron/calendar-maintenance
 */

export const runtime = "nodejs";
//Renewal + full sync per mentor can take a few seconds each. 
export const maxDuration = 300;

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }

    // P5-04: sessions complete when their time passes - never on client leave
    const { error: completeError } = await supabaseAdmin
      .from("mentor_sessions")
      .update({ status: "completed"})
      .eq("status", "confirmed")
      .lt("ends_at", new Date().toISOString());
    if (completeError) console.error("[cron] auto-complete failed:", completeError);
    
    const { data: due, error } = await supabaseAdmin
      .from("calendar_integrations")
      .select("mentor_id")
      .eq("provider", "google")
      .eq("status", "active")
      .lte("renew_at", new Date().toISOString());

      if (error) {
        console.error("[cron] failed to query due integrations:", error);
        return NextResponse.json({ error: "query_failed" }, { status: 500 });
      }

      const results: Array<{
        mentorId: string;
        renewed: boolean;
        sync?: unknown;
        error?: string;
      }> = [];

      for (const row of due ?? []) {
        const mentorId = row.mentor_id as string;
        try {
            const watch = await registerWatchChannel(mentorId);
            const sync = await forceFullSync(mentorId);
            results.push({ mentorId, renewed: true, sync });
            console.log(
                `[cron] renewed mentor =${mentorId} unitl=${watch.channelExpiry.toISOString()}`, 
                JSON.stringify(sync)
            );
        } catch (err) {
            if (isInvalidGrantError(err)) {
                //Mentor revoked access in their Google account: flag for reconnect, 
                //don't retry forever. 
                await markIntegrationRevoked(mentorId);
                results.push({ mentorId, renewed: false, error: "revoked" });
                continue;
            }
            //One mentor's failure must not block the others. 
            console.error(`[cron] renewal failed mentor=${mentorId}:`, err);
            results.push({
                mentorId, 
                renewed: false, 
                error: err instanceof Error ? err.message: "unknown", 
            });
        }
      }

      return NextResponse.json({
        checked: due?.length ?? 0, 
        results, 
      });
}
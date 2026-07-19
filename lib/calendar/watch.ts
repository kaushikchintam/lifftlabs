import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCalendarClientForMentor } from "./client";

/**
 * Watch-channel lifecycle for a mentor's primary calendar. 
 * Sharedy by the OAuth callback (first registration on connect) and the 
 * renewal cron (re-registration before expiry). One implementation so the
 * stop-old/start-new/persist sequence can't drift between the two. 
 */

/** Google caps Calendar watch channels at ~7 days. */
const CHANNEL_LIFTIME_MS = 7 * 24 * 60 * 60 * 1000;

export interface WatchResult {
    channelId: string;
    resourceId: string | null | undefined;
    channelExpiry: Date;
    renewAt: Date;
}

export async function registerWatchChannel(
    mentorId: string
): Promise<WatchResult> {
    const { calendar } = await getCalendarClientForMentor(mentorId);

    // Stop the old channel first, prevents duplicate notifications. 
    // Failure is expected and harmless when the old channel already expired. 
    const { data: existing } = await supabaseAdmin
      .from("calendar_integrations")
      .select("channel_id, resource_id")
      .eq("mentor_id", mentorId)
      .eq("provider", "google")
      .maybeSingle();

    if (existing?.channel_id && existing?.resource_id) {
        try { 
            await calendar.channels.stop({
                requestBody: {
                    id: existing.channel_id, 
                    resourceId: existing.resource_id, 
                }, 
            });
        } catch { 
            //Already expired/stopped, fine. 
        }
    }

    const channelId = crypto.randomUUID();
    const requestedExpiry = Date.now() + CHANNEL_LIFTIME_MS;

    const watchRes = await calendar.events.watch({
        calendarId: "primary", 
        requestBody: {
            id: channelId, 
            type: "web_hook", 
            address: `${process.env.BETTER_AUTH_URL}/api/webhooks/google-calendar`,
            token: mentorId, // inforamtional only, the webhook authenticates via (channel_id, resource_id)
            expiration: requestedExpiry.toString(), 
        },
    });

    // Google may grant less than requested, trust the response. 
    const channelExpiry = watchRes.data.expiration
      ? new Date(parseInt(watchRes.data.expiration))
      : new Date(requestedExpiry);

      // Renew at 50% of the granted lifetime. 
      const renewAt = new Date(
        Date.now() + (channelExpiry.getTime() - Date.now()) / 2
      );

      await supabaseAdmin
        .from("calendar_integrations")
        .update({
            channel_id: channelId, 
            resource_id: watchRes.data.resourceId, 
            channel_expiry: channelExpiry.toISOString(), 
            renew_at: renewAt.toISOString(), 
            updated_at: new Date().toISOString(), 
        })
        .eq("mentor_id", mentorId)
        .eq("provider", "google");

        return {
            channelId, 
            resourceId: watchRes.data.resourceId, 
            channelExpiry, 
            renewAt, 
        };
}
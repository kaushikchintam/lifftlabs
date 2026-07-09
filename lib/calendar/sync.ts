import { google } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function syncMentorCalendar(mentorId: string): Promise<void> {
    const { data: integration, error } = await supabaseAdmin
        .from("calendar_integrations")
        .select("access_token, refresh_token, token_expiry, sync_token")
        .eq("mentor_id", mentorId)
        .eq("provider", "google")
        .single();

    if (error || !integration) return;

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BETTER_AUTH_URL}/api/auth/google-calendar/callback`
    );

    oauth2Client.setCredentials({
        access_token: integration.access_token, 
        refresh_token: integration.refresh_token, 
        expiry_date: new Date(integration.token_expiry).getTime(),
    });

    //Save refreshed token if googleapis auto-refreshes it, (this is an event listener for automatic token refresh, it solves the problem of access tokens expiring)
    oauth2Client.on("tokens", async (tokens) => {
        if (tokens.access_token) {
            await supabaseAdmin
              .from("calendar_integrations")
              .update({
                access_token: tokens.access_token,
                ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
                token_expiry: tokens.expiry_date
                    ? new Date(tokens.expiry_date).toISOString()
                    : undefined,
                updated_at: new Date().toISOString(),
              })
              .eq("mentor_id", mentorId)
              .eq("provider", "google");
        }
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await fetchAndStore(mentorId, calendar, integration.sync_token ?? undefined);
}

async function fetchAndStore(
    mentorId: string,
    calendar: ReturnType<typeof google.calendar>, 
    syncToken?: string, 
    isRetry = false
): Promise<void> {
    const now = new Date();

    let pageToken: string | undefined;
    let nextSyncToken: string | undefined;

    const toDelete: string[] = [];
    const toUpsert: { mentor_id: string; google_event_id: string; blocker_range: string; updated_at: string }[] = [];

    do { 
        let res;
        try {
            res = await calendar.events.list({
                calendarId: "primary",
                singleEvents: true, 
                ...(syncToken
                    ? { syncToken }
                    : {
                        timeMin: now.toISOString(),
                        timeMax: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    }),
                pageToken,
                maxResults: 250, 
            });
        }
        catch (err: unknown) {
            const status = (err as { code?: number }).code;
            if (status === 410 && !isRetry) {
                // syncToken expired, clear it and do a full sync
                await supabaseAdmin
                  .from("calendar_integrations")
                  .update({ sync_token: null })
                  .eq("mentor_id", mentorId)
                  .eq("provider", "google");
                return fetchAndStore(mentorId, calendar, undefined, true);
            }
            throw err;
        }

        for (const event of res.data.items ?? []) {
            if (!event.id) continue;

            if (event.status === "cancelled") {
                toDelete.push(event.id);
                continue;
            }
            let start: string;
            let end: string;

            if (event.start?.dateTime && event.end?.dateTime) {
                start = event.start.dateTime;
                end = event.end.dateTime;
            } else if (event.start?.date && event.end?.date) {
                //All-day event - block the full day in UTC
                start = new Date(event.start.date).toISOString();
                end = new Date(event.end.date).toISOString();
            } else{
                continue;
            }

            toUpsert.push({
                mentor_id: mentorId, 
                google_event_id: event.id, 
                blocker_range: `[${start}, ${end})`,
                updated_at: new Date().toISOString(),
            });
        }

        nextSyncToken = res.data.nextSyncToken ?? undefined;
        pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    if (toDelete.length) {
        await supabaseAdmin
          .from("google_calendar_blockers")
          .delete()
          .eq("mentor_id", mentorId)
          .in("google_event_id", toDelete);
    }

    if (toUpsert.length) {
        await supabaseAdmin
          .from("google_calendar_blockers")
          .upsert(toUpsert, { onConflict: "mentor_id,google_event_id" });
    }

    if (nextSyncToken) {
        await supabaseAdmin
          .from("calendar_integrations")
          .update({ sync_token: nextSyncToken, updated_at: new Date().toISOString() })
          .eq("mentor_id", mentorId)
          .eq("provider", "google");
    }
}
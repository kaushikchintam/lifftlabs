import { google } from "googleapis";
import { calendar_v3 } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fromZonedTime } from "date-fns-tz";
import {
    getCalendarClientForMentor, 
    markIntegrationRevoked, 
    isInvalidGrantError, 
    CalendarNotConnectedError, 
    CalendarRevokedError, 
} from "./client";

/** Blockers are only synced within this horizon. Must be >= your booking
 * horizon plus slack. The sync token freezes the window it was created with, 
 * so forceFullSync() must run periodically (piggyback on the channel-renewal
 * cron) to roll the window forward 
 */
const SYNC_HORIZON_DAYS = 60;
const DEFAULT_TZ = "Europe/London";

//Discriminated union type 
export type SyncResult = 
  | { mode: "full" | "incremental"; upserted: number; deleted: number; slotsWithdrawn: number }
  | { mode: "skipped"; reason: "not_connected" | "revoked" };

interface BlockerRow {
    google_event_id: string;
    blocker_range: string;
    lifft_session_id: string | null;
}

//ENTRY POINTS

export async function syncMentorCalendar(mentorId: string): Promise<SyncResult> {
    let ctx;
    try {
        ctx = await getCalendarClientForMentor(mentorId);
    } catch(err) {
        if (err instanceof CalendarNotConnectedError)
            return { mode: "skipped", reason: "not_connected" };
        if (err instanceof CalendarRevokedError)
            return { mode: "skipped", reason: "revoked" };
        throw err;
    }

    try { 
        return await fetchAndStore(mentorId, ctx.calendar, ctx.syncToken);
    } catch (err) {
        if (isInvalidGrantError(err)) {
            await markIntegrationRevoked(mentorId);
            return { mode: "skipped", reason: "revoked" };
        }
        throw err;
    }
}

/** Discard the sync token and re-establish a fresh bounded window.
 * Call from the channel-renewal cron (P3-06) so the horizon rolls forward.
 */
export async function forceFullSync(mentorId: string): Promise<SyncResult> {
    await supabaseAdmin
      .from("calendar_integrations")
      .update({ sync_token: null })
      .eq("mentor_id", mentorId)
      .eq("provider", "google");
    return syncMentorCalendar(mentorId);
}

//Core
async function fetchAndStore(
    mentorId: string,
    calendar: ReturnType<typeof google.calendar>, 
    syncToken?: string, 
    isRetry = false
): Promise<SyncResult> {
    const now = new Date();
    const mode: "full" | "incremental" = syncToken ? "incremental" : "full";

    let pageToken: string | undefined;
    let nextSyncToken: string | undefined;
    let calendarTz = DEFAULT_TZ;

    const toDelete: string[] = [];
    const toUpsert: BlockerRow[] = [];

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
                        timeMax: new Date(
                            now.getTime() + SYNC_HORIZON_DAYS * 24 * 60 * 60 * 1000
                        ).toISOString(),
                    }),
                pageToken,
                maxResults: 250, 
            });
        }
        catch (err: unknown) {
            const status = (err as { code?: number }).code;
            if (status === 410 && !isRetry) {
                // syncToken expired, the delta is unrepresentable, so the retry MUST
                // be a full replace (handled below by mode === "full").
                await supabaseAdmin
                  .from("calendar_integrations")
                  .update({ sync_token: null })
                  .eq("mentor_id", mentorId)
                  .eq("provider", "google");
                return fetchAndStore(mentorId, calendar, undefined, true);
            }
            throw err;
        }

        if (res.data.timeZone) calendarTz = res.data.timeZone;

        for (const event of res.data.items ?? []) {
            if (!event.id) continue;

            if (event.status === "cancelled") {
                toDelete.push(event.id);
                continue;
            }

            const row = mapEventToBlocker(mentorId, event, calendarTz);
            if (row) toUpsert.push(row);
        }

        nextSyncToken = res.data.nextSyncToken ?? undefined;
        pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    // Writes go through RPCs: atomic, advisory-locked per mentor, and each one
    // finishes by reconciling open slots against the new blocker state.

    let slotsWithdrawn = 0;

    if (mode === "full") {
        const { data, error } = await supabaseAdmin.rpc("replace_mentor_blockers", {
            p_mentor_id: mentorId,
            p_blockers: toUpsert,
        });
        if (error) throw error;
        slotsWithdrawn = data ?? 0;
    } else {
        const { data, error } = await supabaseAdmin.rpc("apply_blocker_delta", {
            p_mentor_id: mentorId, 
            p_upserts: toUpsert, 
            p_delete_ids: toDelete,
        });
        if (error) throw error;
        slotsWithdrawn = data ?? 0;
    }

    // Bookmark AFTER the data writes: a crash between the two re-processes
    // events (harmless, idempotent) rather than skipping them (data loss).
    if (nextSyncToken) {
        await supabaseAdmin
          .from("calendar_integrations")
          .update({
             sync_token: nextSyncToken, 
             updated_at: new Date().toISOString(),
            })
          .eq("mentor_id", mentorId)
          .eq("provider", "google");
    }

    return {
        mode, 
        upserted: toUpsert.length,
        deleted: mode === "incremental" ? toDelete.length : 0,
        slotsWithdrawn,
    };
}

// ---------------------------------------------------------------------------
// Pure mapping/filtering — the unit-testable core.
// Returns null for events that should NOT block availability.
// ---------------------------------------------------------------------------

export function mapEventToBlocker(
    menotrId: string, 
    event: calendar_v3.Schema$Event, 
    calendarTz: string
): BlockerRow | null {
    //Mentor market it "Free" (includes most all-day reminder-type events)
    if (event.transparency === "transparent") return null;

    //Mentor declined this invitation
    const self = event.attendees?.find((a) => a.self);
    if (self?.responseStatus === "declined") return null;

    let start: string;
    let end: string;

    if (event.start?.dateTime && event.end?.dateTime) {
        start = event.start.dateTime;
        end = event.end.dateTime;
    } else if (event.start?.date && event.end?.date) {
        // All-day event: interpret midnight in the CALENDAR's timezone,
        // not UTC — otherwise BST all-day blocks are offset by an hour.
        start = fromZonedTime(`${event.start.date}T00:00:00`, calendarTz).toISOString();
        end = fromZonedTime(`${event.end.date}T00:00:00`, calendarTz).toISOString();
    } else {
        return null;
    }

    return {
        google_event_id: event.id!,
        // [startm end) -end-exclusive so back-to-back events don't overlap
        blocker_range: `[${start}, ${end}]`,
        lifft_session_id:
          event.extendedProperties?.private?.lifft_session_id ?? null,
    };
}
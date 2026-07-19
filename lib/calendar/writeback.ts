import { supabaseAdmin } from "@/lib/supabase/admin";
import {
    getCalendarClientForMentor, 
    markIntegrationRevoked, 
    isInvalidGrantError,
} from "./client";

/**
 * Write-back: mirror confirmed LIFFT sessions onto the mentor's Google
 * Calendar. LIFFT is the source of truth; Google is a mirror. Every function
 * here is BEST-EFFORT, callers must never let a failure here fail a booking
 * or a webhook response. Both functions swallow errors after logging and 
 * return a boolean so callers can log/alert. 
 */

export async function createSessionCalendarEvent(
    sessionId: string
): Promise<boolean> {
    try {
        const { data: session, error } = await supabaseAdmin
        .from("mentor_sessions")
        .select("id, mentor_id, learner_id, booking_range, google_event_id")
        .eq("id", sessionId)
        .single();

        if (error || !session) return false;
        if (session.google_event_id) return true; //already mirrored idempotent

        //Learner email for the attendee invite.
        const { data: learner } = await supabaseAdmin
          .from("user")
          .select("email")
          .eq("id", session.learner_id) 
          .single();

    // tstzrange comes back as e.g. ["2026-07-14 14:00:00+00","2026-07-14 15:00:00+00")
    const { start, end } = parseTstzRange(session.booking_range);
    if (!start || !end) return false;

    const { calendar } = await getCalendarClientForMentor(session.mentor_id);

    const res = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all", // Google emails the learner a real calendar invite
      requestBody: {
        summary: "LIFFT Mentoring Session",
        description: `Join your session: ${process.env.BETTER_AUTH_URL}/dashboard/sessions/${session.id}`,
        start: { dateTime: start },
        end: { dateTime: end },
        ...(learner?.email
          ? { attendees: [{ email: learner.email }] }
          : {}),
        extendedProperties: {
          private: { lifft_session_id: session.id },
        },
      },
    });

    if (res.data.id) { 
        await supabaseAdmin
         .from("mentor_sessions")
         .update({ google_event_id: res.data.id })
         .eq("id", session.id);
    }
    return true;
} catch (err) {
    if (isInvalidGrantError(err)) {
        //Session data is fine; only the mirror failed. Flag for reconnect. 
        const { data } = await supabaseAdmin
          .from("mentor_sessions")
          .select("mentor_id")
          .eq("id", sessionId)
          .single();
        if (data) await markIntegrationRevoked(data.mentor_id);
    }
    console.error(`[writeback] insert failer for session ${sessionId}:`, err);
    return false;
    }
}

/**
 * Call on LIFFT-side cancellation. Deleting the event with sendUpdates:"all"
 * makes Google email the cancellation to the learner too. */
export async function deleteSessionCalendarEvent(
    sessionId: string
): Promise<boolean> {
    try {
        const { data: session } = await supabaseAdmin
          .from("mentor_sessions")
          .select("mentor_id, google_event_id")
          .eq("id", sessionId)
          .single();

        if (!session?.google_event_id) return true; //nothing to remove

        const { calendar } = await getCalendarClientForMentor(session.mentor_id);
        await calendar.events.delete({
          calendarId: "primary", 
          eventId: session.google_event_id, 
          sendUpdates: "all", 
        });

        await supabaseAdmin
          .from("mentor_sessions")
          .update({ google_event_id: null })
          .eq("id", sessionId);
        return true;
    } catch (err) {
        // 404/410 = mentor already deleted it themselves; treat as done. 
        const code = (err as { code?: number }).code;
        if (code === 404 || code === 410) return true;
        console.error(`[writeback] delete failed for session ${sessionId}:`, err);
        return false;
    }
}

function parseTstzRange(range: string | null): {
    start: string | null;
    end: string | null;
} {
    if (!range) return { start: null, end: null }; 
    const match = range.match(/^[\[\(]"?([^,"]+)"?\s*,\s*"?([^\)\]"]+)"?[\)\]]$/);
  if (!match) return { start: null, end: null };
  return {
    start: new Date(match[1]).toISOString(),
    end: new Date(match[2]).toISOString(),
  };
}
import { google, calendar_v3 } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** 
 * Shared per-mentor Calendar client construction. 
 * Used by sync.ts (reads) and writeback.ts (writes), one place for the 
 * constructor, credential hydration, and the token-refresh persistence
 * listener, so the closure-over-mentorId pattern lives exactly one file. 
 */

export class CalendarNotConnectedError extends Error {
    constructor(mentorId: string) {
        super(`No active Google Calendar integration for mentor ${mentorId}`);
        this.name = "CalendarNotConnectedError";
    }
}

export class CalendarRevokedError extends Error {
    constructor(mentorId: string) {
        super(`Google Calendar access revoked for mentor ${mentorId}`);
        this.name = "CalendarRevokedError";
    }
}

export interface MentorCalendarContext {
    calendar: calendar_v3.Calendar;
    syncToken?: string;
}

export async function getCalendarClientForMentor(
    mentorId: string
): Promise<MentorCalendarContext> {
    const { data: integration, error } = await supabaseAdmin
        .from("calendar_integrations")
        .select("access_token, refresh_token, token_expiry, sync_token, status")
        .eq("mentor_id", mentorId)
        .eq("provider", "google")
        .maybeSingle();

    if (error || !integration) throw new CalendarNotConnectedError(mentorId);
    if (integration.status === "revoked") throw new CalendarRevokedError(mentorId);

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

  //Persist refreshed tokens. Fresh client per mentor per operation means
  //this closure is always bound to the right now. 
  oauth2Client.on("tokens", async (tokens) => {
    if (!tokens.access_token) return;
    await supabaseAdmin
      .from("calendar_integrations")
      .update({
        access_token: tokens.access_token, 
        ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token }: {}),
        ...(tokens.expiry_date
            ? { token_expiry: new Date(tokens.expiry_date).toISOString() }
            : {}),
            updated_at: new Date().toISOString(),
      })
      .eq("mentor_id", mentorId)
      .eq("provider", "google");
  });

  return { 
    calendar: google.calendar({ version: "v3", auth: oauth2Client }),
    syncToken: integration.sync_token ?? undefined, 
  };
}

/** Mentor revoked access in their Google account, mark it so the dashboard can 
 * show a "reconnect your calendar" prompt instead of silently freezing
 */
export async function markIntegrationRevoked(mentorId: string): Promise<void> {
    await supabaseAdmin
      .from("calendar_integrations")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("mentor_id", mentorId)
      .eq("provider", "google");
}

export function isInvalidGrantError(err: unknown): boolean {
    if (err instanceof Error && err.message.includes("invalid_grant")) return true;
    const data = (err as {  response?: { data?: { error?: string } } })?.response
        ?.data;
    return data?.error === "invalid_grant";
}
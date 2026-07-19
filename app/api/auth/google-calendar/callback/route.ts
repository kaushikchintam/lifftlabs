import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { auth } from "@/lib/auth";
import { registerWatchChannel } from "@/lib/calendar/watch";
import { syncMentorCalendar } from "@/lib/calendar/sync";

const DASHBOARD = new URL("/calendar", process.env.BETTER_AUTH_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");  // google has redirected the user back here with a code, and this route exchanges it for tokens, persists them, and sets up push notifications.
  const mentorId = searchParams.get("state");
  const error = searchParams.get("error");

  //Basic Validation
  if (error || !code || !mentorId) {
    return NextResponse.redirect(`${DASHBOARD.toString()}?error=missing_params`);
  }

  //Session validation
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.id !== mentorId) {
    return NextResponse.redirect(new URL("/login", process.env.BETTER_AUTH_URL!));
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BETTER_AUTH_URL}/api/auth/google-calendar/callback`
  );

  let tokens;
  try {
    //Handle the "Single-Use code" risk
    const response = await oauth2Client.getToken(code);           //exchange the code for tokens
    tokens = response.tokens;
  } catch (tokenErr){
    console.error("Token exchange failed (likely code expired or refused:", tokenErr);
    return NextResponse.redirect(`${DASHBOARD.toString()}?error=oauth_timeout`);
  }


  const tokenExpiry = tokens.expiry_date
    ? new Date(tokens.expiry_date)
    : new Date(Date.now() + 60 * 60 * 1000);

  //Fetch existing data to preserve refresh_token across re-auth.
  const { data: existing } = await supabaseAdmin
    .from("calendar_integrations")
    .select("refresh_token")
    .eq("mentor_id", mentorId)
    .eq("provider", "google")
    .maybeSingle();

  await supabaseAdmin.from("calendar_integrations").upsert({
    mentor_id: mentorId,
    provider: "google",
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token ?? existing?.refresh_token ?? "",
    token_expiry: tokenExpiry.toISOString(),
    //Reconnecting heals a revoked integration: fresh consent = fresh grant,
    // so flip status back to active or getCalendarClientForMentor keeps
    // throwing CalendarRevokedError despite valid tokens.
    status : "active",
    updated_at: new Date().toISOString(),
  }, { onConflict: "mentor_id,provider" });

  try { 
    await syncMentorCalendar(mentorId);
  } catch (syncErr) {
    console.error("Initial calendar sync failed:", syncErr);
    // Tokens saved; sync retries via webhook/cron - dont fail connect. 
  }

  // Register (or re-register) the push channel. registerWatchChannel reads
  // the tokens we just upserted, stops any old channel itself, and persists
  // channel_id / resource_id / channel_expiry / renew_at — same code path
  // the renewal cron uses, so the two can't drift.
  try {
    await registerWatchChannel(mentorId);
  } catch (watchErr) {
    console.error("Webhook setup failed:", watchErr);
    // We don't redirect with error here because the tokens are already saved.
    // The user is integrated, just without push notifications — the daily
    // cron will retry registration once renew_at (or a manual sync) is due.
  }

  return NextResponse.redirect(DASHBOARD);
}
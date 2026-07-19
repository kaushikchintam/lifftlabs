import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend/client"; // adjust if your export name differs
import SessionReminder from "@/emails/session-reminder";

/**
 * Session reminders (P3-13 / EM-05), triggered daily by Vercel Cron.
 *
 * Window: confirmed sessions starting within the next 26 hours that haven't
 * been reminded. Daily granularity means "roughly 24h before" — some
 * recipients get 25h notice, some 4h if booked same-day. The 26h ceiling +
 * reminder_sent_at guard keeps it to exactly one reminder per session.
 *
 * Idempotency: reminder_sent_at is stamped BEFORE sending. A crash between
 * stamp and send loses one reminder (acceptable); the reverse order would
 * risk duplicates on retry (worse).
 */

export const runtime = "nodejs";
export const maxDuration = 120;

const FROM = process.env.EMAIL_FROM ?? "LIFFT <hello@mail.lifftlabs.com>";

interface ReminderRow {
  id: string;
  scheduled_at: string;
  timezone: string;
  mentor: { name: string; email: string } | null;
  learner: { name: string; email: string } | null;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const ceiling = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  const { data, error } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, timezone,
       mentor:user!mentor_sessions_mentor_id_fkey(name, email),
       learner:user!mentor_sessions_learner_id_fkey(name, email)`
    )
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gt("scheduled_at", now.toISOString())
    .lte("scheduled_at", ceiling.toISOString());

  if (error) {
    console.error("[reminders] query failed:", error);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (const raw of data ?? []) {
    const s = raw as unknown as ReminderRow;
    if (!s.mentor?.email || !s.learner?.email) continue;

    // Stamp first — see header comment.
    const { data: stamped } = await supabaseAdmin
      .from("mentor_sessions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", s.id)
      .is("reminder_sent_at", null) // guards against a concurrent run
      .select("id")
      .maybeSingle();

    if (!stamped) continue; // another invocation got there first

    const whenFormatted = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: s.timezone || "Europe/London",
      timeZoneName: "short",
    }).format(new Date(s.scheduled_at));

    const sessionUrl = `${process.env.BETTER_AUTH_URL}/sessions/${s.id}`;

    const recipients = [
      { to: s.learner.email, name: s.learner.name, counterpart: s.mentor.name },
      { to: s.mentor.email, name: s.mentor.name, counterpart: s.learner.name },
    ];

    try {
      for (const r of recipients) {
        const html = await render(
          SessionReminder({
            recipientName: r.name,
            counterpartName: r.counterpart,
            whenFormatted,
            sessionUrl,
          })
        );
        await resend.emails.send({
          from: FROM,
          to: r.to,
          subject: `Reminder: your session — ${whenFormatted}`,
          html,
        });
      }
      sent++;
    } catch (err) {
      console.error(`[reminders] send failed for session ${s.id}:`, err);
      failures.push(s.id);
      // reminder_sent_at stays stamped — deliberate: no duplicate risk,
      // failures are visible here and in Resend's dashboard.
    }
  }

  return NextResponse.json({
    eligible: data?.length ?? 0,
    sent,
    failures,
  });
}
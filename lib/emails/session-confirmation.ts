import { render } from "@react-email/render";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend/client"; // adjust if your export name differs
import { buildSessionIcs } from "@/lib/calendar/ics";
import SessionConfirmation from "@/emails/session-confirmation";

/**
 * EM-04 / P3-12. Called from the Stripe webhook after confirm_session
 * succeeds. Best-effort by contract: log failures, never throw into the
 * webhook — the booking is confirmed the moment the DB says so.
 */

const FROM = process.env.EMAIL_FROM ?? "LIFFT <hello@mail.lifftlabs.com>";

export async function sendSessionConfirmation(
  sessionId: string
): Promise<boolean> {
  try {
    const { data: s } = await supabaseAdmin
      .from("mentor_sessions")
      .select(
        `id, scheduled_at, ends_at, timezone,
         mentor:user!mentor_sessions_mentor_id_fkey(name, email),
         learner:user!mentor_sessions_learner_id_fkey(name, email)`
      )
      .eq("id", sessionId)
      .maybeSingle();

    if (!s) return false;

    const row = s as unknown as {
      id: string;
      scheduled_at: string;
      ends_at: string;
      timezone: string;
      mentor: { name: string; email: string } | null;
      learner: { name: string; email: string } | null;
    };
    if (!row.mentor?.email || !row.learner?.email) return false;

    const start = new Date(row.scheduled_at);
    const end = new Date(row.ends_at);
    const tz = row.timezone || "Europe/London";
    const whenFormatted = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
      timeZoneName: "short",
    }).format(start);

    const sessionUrl = `${process.env.BETTER_AUTH_URL}/sessions/${row.id}`;

    const ics = buildSessionIcs({
      uid: row.id,
      start,
      end,
      summary: `LIFFT mentoring session — ${row.mentor.name} & ${row.learner.name}`,
      description: `Join your session: ${sessionUrl}`,
      organizerEmail: "hello@mail.lifftlabs.com",
      attendees: [
        { name: row.mentor.name, email: row.mentor.email },
        { name: row.learner.name, email: row.learner.email },
      ],
      url: sessionUrl,
    });
    const icsAttachment = {
      filename: "lifft-session.ics",
      content: Buffer.from(ics),
    };

    const recipients: Array<{
      to: string;
      name: string;
      counterpart: string;
      role: "mentor" | "learner";
    }> = [
      {
        to: row.learner.email,
        name: row.learner.name,
        counterpart: row.mentor.name,
        role: "learner",
      },
      {
        to: row.mentor.email,
        name: row.mentor.name,
        counterpart: row.learner.name,
        role: "mentor",
      },
    ];

    for (const r of recipients) {
      const html = await render(
        SessionConfirmation({
          recipientName: r.name,
          counterpartName: r.counterpart,
          recipientRole: r.role,
          whenFormatted,
          sessionUrl,
        })
      );

      await resend.emails.send({
        from: FROM,
        to: r.to,
        subject: `Session confirmed — ${whenFormatted}`,
        html,
        attachments: [icsAttachment],
      });
    }

    return true;
  } catch (err) {
    console.error(`[email] confirmation failed for session ${sessionId}:`, err);
    return false;
  }
}
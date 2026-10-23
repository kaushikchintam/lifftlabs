import { supabaseAdmin } from "@/lib/supabase/admin";
import { GRACE_AFTER_END_MS } from "@/lib/join-window";

export type Role = "mentor" | "learner";

export interface SessionRow {
  id: string;
  scheduledAt: string;
  endsAt: string;
  status: string;
  journey: string | null;
  intakeId: string | null;
  mentorId: string;
  learnerId: string;
  mentorName: string;
  learnerName: string;
  mentorSharePence: number | null;
  refunded: boolean;
  transferred: boolean;
}

/** All of a user's sessions, newest first. Expired holds are noise, so they're left out. */
export async function sessionsFor(userId: string, role: Role): Promise<SessionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, ends_at, status, journey, intake_id, mentor_id, learner_id,
       mentor_share_pence, refunded_at, transferred_at,
       mentor:user!mentor_sessions_mentor_id_fkey(name),
       learner:user!mentor_sessions_learner_id_fkey(name)`
    )
    .eq(role === "mentor" ? "mentor_id" : "learner_id", userId)
    .in("status", ["pending", "confirmed", "completed", "cancelled"])
    .order("scheduled_at", { ascending: false });
  if (error) throw error;

  type Raw = {
    id: string; scheduled_at: string; ends_at: string; status: string; journey: string | null;
    intake_id: string | null; mentor_id: string; learner_id: string; mentor_share_pence: number | null;
    refunded_at: string | null; transferred_at: string | null;
    mentor: { name: string } | null; learner: { name: string } | null;
  };
  return ((data ?? []) as unknown as Raw[]).map((r) => ({
    id: r.id,
    scheduledAt: r.scheduled_at,
    endsAt: r.ends_at,
    status: r.status,
    journey: r.journey,
    intakeId: r.intake_id,
    mentorId: r.mentor_id,
    learnerId: r.learner_id,
    mentorName: r.mentor?.name || "Mentor",
    learnerName: r.learner?.name || "Learner",
    mentorSharePence: r.mentor_share_pence,
    refunded: !!r.refunded_at,
    transferred: !!r.transferred_at,
  }));
}

/** The soonest confirmed session that hasn't finished (incl. join grace). */
export function nextSession(rows: SessionRow[], now = Date.now()): SessionRow | null {
  return (
    rows
      .filter((r) => r.status === "confirmed" && new Date(r.endsAt).getTime() + GRACE_AFTER_END_MS > now)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0] ?? null
  );
}

/** counterpart user id → conversation id (one 1:1 conversation per pair). */
export async function conversationsByCounterpart(userId: string): Promise<Map<string, string>> {
  const { data: mine } = await supabaseAdmin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);
  const ids = (mine ?? []).map((m) => m.conversation_id);
  if (ids.length === 0) return new Map();
  const { data: others } = await supabaseAdmin
    .from("conversation_participants")
    .select("conversation_id, user_id")
    .in("conversation_id", ids)
    .neq("user_id", userId);
  return new Map((others ?? []).map((o) => [o.user_id, o.conversation_id]));
}

export interface Intake {
  id: string;
  journey: string;
  answers: Record<string, string[]>;
  sharedKeys: string[];
}

export async function intakesById(ids: (string | null)[]): Promise<Map<string, Intake>> {
  const wanted = [...new Set(ids.filter(Boolean))] as string[];
  if (wanted.length === 0) return new Map();
  const { data } = await supabaseAdmin
    .from("intakes")
    .select("id, journey, answers, shared_keys")
    .in("id", wanted);
  return new Map(
    (data ?? []).map((i) => [
      i.id,
      { id: i.id, journey: i.journey, answers: i.answers as Record<string, string[]>, sharedKeys: i.shared_keys as string[] },
    ])
  );
}

/** "Book again" (same mentor) or "Book with a different mentor": the Mentors
 *  tab for that journey, linked to the previous session. */
export function rebookHref(session: SessionRow, intake: Intake | undefined, sameMentor: boolean): string {
  const q = new URLSearchParams({ previous: session.id });
  const journey = session.journey ?? intake?.journey;
  if (journey) q.set("journey", journey);
  if (sameMentor) q.set("mentor", session.mentorId);
  return `/mentors?${q}`;
}

export async function mentorHeadlines(ids: string[]): Promise<Map<string, string | null>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabaseAdmin.from("mentor_profiles").select("user_id, headline").in("user_id", [...new Set(ids)]);
  return new Map((data ?? []).map((m) => [m.user_id, m.headline]));
}

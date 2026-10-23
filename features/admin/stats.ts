import { supabaseAdmin } from "@/lib/supabase/admin";
import { JOURNEYS } from "@/features/journeys/config";
import { isAdminEmail } from "@/lib/auth/require-admin";

/** A booking is "real" unless the learner is on the team (test bookings). */
export function isRealLearner(email: string | null | undefined): boolean {
  return !!email && !isAdminEmail(email);
}

export interface BookingRow {
  id: string;
  scheduled_at: string;
  status: string;
  journey: string | null;
  amount_pence: number | null;
  fee_pence: number | null;
  stripe_payment_intent_id: string | null;
  transferred_at: string | null;
  refunded_at: string | null;
  previous_session_id: string | null;
  mentor: { name: string } | null;
  learner: { name: string; email: string } | null;
}

/** Paid bookings = has a payment intent (set when checkout completes). */
export async function paidBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, status, journey, amount_pence, fee_pence, stripe_payment_intent_id,
       transferred_at, refunded_at, previous_session_id,
       mentor:user!mentor_sessions_mentor_id_fkey(name),
       learner:user!mentor_sessions_learner_id_fkey(name, email)`
    )
    .not("stripe_payment_intent_id", "is", null)
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BookingRow[];
}

export const FUNNEL_STEPS = ["Chose journey", "Intake", "Signed up", "Checkout", "Paid", "Completed", "Rebooked"] as const;

/** Per journey: first three steps are distinct people from funnel_events;
 *  the rest come from bookings. ponytail: counts in JS — fine to ~10k events, then a SQL view */
export async function funnelByJourney() {
  const [{ data: events }, { data: checkouts }, paid] = await Promise.all([
    supabaseAdmin.from("funnel_events").select("journey, step, anon_id, user_id"),
    supabaseAdmin.from("mentor_sessions").select("journey, learner_id").not("stripe_checkout_id", "is", null),
    paidBookings(),
  ]);

  const people = (step: string, journey: string) =>
    new Set(
      (events ?? []).filter((e) => e.step === step && e.journey === journey).map((e, i) => e.anon_id ?? e.user_id ?? `event-${i}`)
    ).size;

  const rows = JOURNEYS.map((j) => {
    const mine = paid.filter((b) => b.journey === j.slug);
    return {
      slug: j.slug,
      title: j.title,
      counts: [
        people("chose_journey", j.slug),
        people("intake", j.slug),
        people("signed_up", j.slug),
        new Set((checkouts ?? []).filter((c) => c.journey === j.slug).map((c) => c.learner_id)).size,
        mine.filter((b) => !b.refunded_at).length,
        mine.filter((b) => b.status === "completed" && !b.refunded_at).length,
        mine.filter((b) => b.previous_session_id).length,
      ],
    };
  });
  const total = FUNNEL_STEPS.map((_, i) => rows.reduce((sum, r) => sum + r.counts[i], 0));
  return { rows, total };
}

/** Mentors with what the console shows: live state, payouts, hours, price. */
export async function mentorRows() {
  const [{ data: profiles }, { data: hours }, { data: slots }] = await Promise.all([
    supabaseAdmin
      .from("mentor_profiles")
      .select("user_id, headline, journeys, hourly_rate_pence, charges_enabled, paused, user:user(name)"),
    supabaseAdmin.from("mentor_availability").select("mentor_id"),
    supabaseAdmin.from("mentor_open_slots").select("mentor_id").eq("status", "open"),
  ]);
  const hoursBy = new Map<string, number>();
  for (const h of hours ?? []) hoursBy.set(h.mentor_id, (hoursBy.get(h.mentor_id) ?? 0) + 1);
  const withSlots = new Set((slots ?? []).map((s) => s.mentor_id));

  return (profiles ?? []).map((p) => ({
    id: p.user_id as string,
    name: (p.user as unknown as { name: string } | null)?.name || "—",
    headline: p.headline as string | null,
    journeys: p.journeys as string[],
    pricePence: p.hourly_rate_pence as number | null,
    chargesEnabled: p.charges_enabled as boolean,
    paused: p.paused as boolean,
    hoursCount: hoursBy.get(p.user_id) ?? 0,
    bookable: withSlots.has(p.user_id),
  }));
}

/** Journey is live when a live mentor in it has an open slot (topic: any live mentor). */
export function liveJourneyCount(mentors: Awaited<ReturnType<typeof mentorRows>>): number {
  const live = mentors.filter((m) => !m.paused && m.bookable);
  return JOURNEYS.filter((j) => (j.matchAcrossJourneys ? live.length > 0 : live.some((m) => m.journeys.includes(j.slug)))).length;
}

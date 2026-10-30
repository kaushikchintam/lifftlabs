import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Journey } from "@/features/journeys/config";
import { rankMentors, type Candidate, type Ranked } from "./rank";

/** Bookable = starts at least this far ahead (the 35-min hold must fit). */
const MIN_NOTICE_MS = 60 * 60 * 1000;
const WINDOW_DAYS = 14;
export const SLOTS_PER_CARD = 4;

export interface MatchCard extends Ranked {
  headline: string | null;
  bio: string | null;
  credentials: string | null;
  journeys: string[];
  pricePence: number;
  slotIds: string[];
  /** Payouts connected — until then the card shows "Booking opens soon". */
  bookable: boolean;
  image: string | null;
}

interface MentorRow {
  user_id: string;
  kind: string;
  tags: string[];
  journeys: string[];
  headline: string | null;
  bio: string | null;
  credentials: string | null;
  hourly_rate_pence: number | null;
  charges_enabled: boolean;
  user: { name: string; image: string | null } | null;
}

/** Live = approved profile, not paused. Payouts not required to be listed (booking checks them). Optional mentor filter for "Book again". */
async function liveMentors(journey: Journey | null, mentorId?: string): Promise<MentorRow[]> {
  let q = supabaseAdmin
    .from("mentor_profiles")
    .select("user_id, kind, tags, journeys, headline, bio, credentials, hourly_rate_pence, charges_enabled, user:user(name, image)")
    .eq("paused", false)
    .not("hourly_rate_pence", "is", null);
  if (journey && !journey.matchAcrossJourneys) q = q.contains("journeys", [journey.slug]);
  if (mentorId) q = q.eq("user_id", mentorId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as MentorRow[];
}

/** tstzrange text `["2026-10-22 18:00:00+00","2026-10-22 19:00:00+00")` → ISO start. */
export function rangeStart(range: string): string {
  const raw = range.slice(1).split(",")[0].replace(/"/g, "");
  return new Date(raw.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00")).toISOString();
}

async function openSlots(mentorIds: string[]) {
  if (mentorIds.length === 0) return new Map<string, { id: string; start: string }[]>();
  const now = Date.now();
  const { data, error } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("id, mentor_id, slot_range")
    .in("mentor_id", mentorIds)
    .eq("status", "open")
    // starts after now + notice, ends before now + window
    .rangeGte("slot_range", `[${new Date(now + MIN_NOTICE_MS).toISOString()},)`)
    .rangeLt("slot_range", `[${new Date(now + WINDOW_DAYS * 86_400_000).toISOString()},)`);
  if (error) throw error;

  const byMentor = new Map<string, { id: string; start: string }[]>();
  for (const s of data ?? []) {
    const start = rangeStart(String(s.slot_range));
    const list = byMentor.get(s.mentor_id) ?? [];
    list.push({ id: s.id, start });
    byMentor.set(s.mentor_id, list);
  }
  for (const list of byMentor.values()) list.sort((a, b) => a.start.localeCompare(b.start));
  return byMentor;
}

/** Up to three matches for this journey (empty → waitlist), or with `all`
 *  the Mentors tab: every live mentor, optionally one journey, sharers first. */
export async function findMatches(
  journey: Journey | null,
  learnerTags: string[],
  { mentorId, all = false, onlyShared = false }: { mentorId?: string; all?: boolean; onlyShared?: boolean } = {}
): Promise<MatchCard[]> {
  const mentors = await liveMentors(journey, mentorId);
  const slots = await openSlots(mentors.map((m) => m.user_id));

  const candidates: Candidate[] = mentors.map((m) => ({
    userId: m.user_id,
    name: m.user?.name || "LIFFT mentor",
    kind: m.kind,
    tags: m.tags,
    slots: (slots.get(m.user_id) ?? []).map((s) => s.start),
  }));

  // "Book again" with a named mentor skips kind/tag gating — they chose them.
  const ranked = mentorId
    ? candidates.filter((c) => c.slots.length).map((c) => ({ ...c, shared: [], reason: null }))
    : rankMentors(candidates, learnerTags, {
        all,
        requireShared: all ? onlyShared : !!journey?.matchAcrossJourneys,
      });

  const byId = new Map(mentors.map((m) => [m.user_id, m]));
  return ranked.map((r) => {
    const m = byId.get(r.userId)!;
    const mine = (slots.get(r.userId) ?? []).slice(0, all ? 8 : SLOTS_PER_CARD);
    return {
      ...r,
      slots: mine.map((s) => s.start),
      slotIds: mine.map((s) => s.id),
      headline: m.headline,
      bio: m.bio,
      credentials: m.credentials,
      journeys: m.journeys,
      pricePence: m.hourly_rate_pence ?? 0,
      bookable: m.charges_enabled,
      image: m.user?.image ?? null,
    };
  });
}

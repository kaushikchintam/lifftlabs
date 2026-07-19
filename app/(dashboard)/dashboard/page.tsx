import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ChevronRight,
  Video,
  MessageCircle,
  Calendar,
  Zap,
  Search,
} from "lucide-react";
import { PayoutBanner } from "@/features/payments/components/payout-banner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payouts?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  // Role branch: a mentor_profiles row = mentor view (same source of truth
  // the middleware uses to restore the role cookie).
  const { data: mentorProfile } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (mentorProfile) {
    const { payouts } = await searchParams;
    return (
      <MentorDashboard
        userId={session.user.id}
        firstName={firstName}
        payoutsParam={payouts}
      />
    );
  }

  return <LearnerDashboard userId={session.user.id} firstName={firstName} />;
}

/* ── Shared bits ─────────────────────────────────────────── */

const whenFmt = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz || "Europe/London",
  }).format(new Date(iso));

interface SessionRow {
  id: string;
  scheduled_at: string;
  timezone: string;
  status: string;
  counterpart: { name: string } | null;
}

function SessionRowLink({ s }: { s: SessionRow }) {
  return (
    <Link
      href={`/sessions/${s.id}`}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FBF7EE] transition-colors"
    >
      <div className="w-7 h-7 rounded-full bg-[#E8E2D6] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Video size={13} />
      </div>
      <div className="flex-1">
        <p className="font-dm-sans text-sm text-[#18150F]">
          Session with {s.counterpart?.name ?? "—"}
        </p>
        <p className="font-dm-sans text-xs text-[#6F6B60]">
          {whenFmt(s.scheduled_at, s.timezone)}
          {s.status === "pending" ? " · awaiting payment" : ""}
        </p>
      </div>
      <ChevronRight size={14} className="text-[#6F6B60] mt-1 flex-shrink-0" />
    </Link>
  );
}

/* ── Mentor view ─────────────────────────────────────────── */

async function MentorDashboard({
  userId,
  firstName,
  payoutsParam,
}: {
  userId: string;
  firstName: string;
  payoutsParam?: string;
}) {
  const { data } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, timezone, status,
       counterpart:user!mentor_sessions_learner_id_fkey(name)`
    )
    .eq("mentor_id", userId)
    .in("status", ["pending", "confirmed"])
    .gte("ends_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  const sessions = (data ?? []) as unknown as SessionRow[];

  return (
    <div className="p-10">
      <div className="mb-8">
        <h2 className="font-archivo-black text-5xl text-[#18150F] mb-2">
          Hello, {firstName}
        </h2>
        <p className="font-dm-sans text-lg text-[#6F6B60]">
          Here's your mentoring at a glance.
        </p>
      </div>

      {/* P4-01: shows until charges_enabled; handles ?payouts=submitted */}
      <div className="mb-6">
        <PayoutBanner userId={userId} payoutsParam={payoutsParam} />
      </div>

      <div className="border border-[#E8E2D6] rounded-xl p-6 mb-6">
        <p className="font-dm-sans text-xs text-[#6F6B60] mb-4">
          Upcoming sessions
        </p>
        {sessions.length === 0 ? (
          <p className="font-dm-sans text-sm text-[#6F6B60]">
            Nothing booked yet. Published slots appear to learners as soon as
            payouts are set up.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <SessionRowLink key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/calendar"
          className="border border-[#E8E2D6] rounded-xl p-6 hover:bg-[#FBF7EE] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#E8E2D6] flex items-center justify-center mb-3">
            <Calendar size={13} />
          </div>
          <p className="font-dm-sans text-sm text-[#18150F] mb-1">
            Calendar & slots
          </p>
          <p className="font-dm-sans text-xs text-[#6F6B60]">
            Publish times you're open to mentoring
          </p>
        </Link>
        <Link
          href="/earnings"
          className="border border-[#E8E2D6] rounded-xl p-6 hover:bg-[#FBF7EE] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#E8E2D6] flex items-center justify-center mb-3">
            <Zap size={13} />
          </div>
          <p className="font-dm-sans text-sm text-[#18150F] mb-1">Earnings</p>
          <p className="font-dm-sans text-xs text-[#6F6B60]">
            Paid sessions and your share
          </p>
        </Link>
      </div>
    </div>
  );
}

/* ── Learner view — real data only ───────────────────────── */

async function LearnerDashboard({
  userId,
  firstName,
}: {
  userId: string;
  firstName: string;
}) {
  const [{ data: profile }, { data: sessionsData }, { data: unreadData }] =
    await Promise.all([
      supabaseAdmin
        .from("learner_profiles")
        .select("current_position, target_role")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("mentor_sessions")
        .select(
          `id, scheduled_at, timezone, status,
           counterpart:user!mentor_sessions_mentor_id_fkey(name)`
        )
        .eq("learner_id", userId)
        .in("status", ["pending", "confirmed"])
        .gte("ends_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5),
      // Unread messages across the learner's conversations
      supabaseAdmin
        .from("messages")
        .select("id, conversation:conversations!inner(id)", { count: "exact", head: true })
        .neq("sender_id", userId)
        .is("read_at", null),
    ]);

  const sessions = (sessionsData ?? []) as unknown as SessionRow[];
  const subtitle =
    profile?.current_position && profile?.target_role
      ? `${profile.current_position} → ${profile.target_role}. Here's where you are.`
      : "Here's where you are.";

  // head:true + count gives us the number without rows
  const unreadCount =
    (unreadData as unknown as { count?: number } | null)?.count ?? 0;

  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-archivo-black text-5xl text-[#18150F] mb-2">
          Hello, {firstName}
        </h2>
        <p className="font-dm-sans text-lg text-[#6F6B60]">{subtitle}</p>
      </div>

      {/* Next session — the real milestone */}
      {sessions.length > 0 ? (
        <div className="bg-[#dceaf3] rounded-2xl px-8 py-6 flex items-center justify-between mb-6">
          <div>
            <p className="font-dm-sans text-xs text-[#6F6B60] mb-2">
              Your next session
            </p>
            <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">
              {sessions[0].counterpart?.name ?? "Mentoring session"}
            </h2>
            <p className="font-dm-sans text-sm text-[#6F6B60]">
              {whenFmt(sessions[0].scheduled_at, sessions[0].timezone)}
              {sessions[0].status === "pending" ? " · awaiting payment" : ""}
            </p>
          </div>
          <Link
            href={`/sessions/${sessions[0].id}`}
            className="bg-[#18150F] text-white font-dm-sans text-sm px-5 py-2.5 rounded-full hover:bg-[#2d2a22] transition-colors flex-shrink-0"
          >
            View session
          </Link>
        </div>
      ) : (
        <div className="bg-[#dceaf3] rounded-2xl px-8 py-6 flex items-center justify-between mb-6">
          <div>
            <p className="font-dm-sans text-xs text-[#6F6B60] mb-2">
              Get started
            </p>
            <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">
              Book your first session
            </h2>
            <p className="font-dm-sans text-sm text-[#6F6B60]">
              Find a mentor who's walked the path you're on.
            </p>
          </div>
          <Link
            href="/mentors"
            className="bg-[#18150F] text-white font-dm-sans text-sm px-5 py-2.5 rounded-full hover:bg-[#2d2a22] transition-colors flex-shrink-0"
          >
            Browse mentors
          </Link>
        </div>
      )}

      {/* Bottom 2 cols */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming sessions */}
        <div className="border border-[#E8E2D6] rounded-xl p-6">
          <p className="font-dm-sans text-xs text-[#6F6B60] mb-4">
            Upcoming sessions
          </p>
          {sessions.length === 0 ? (
            <p className="font-dm-sans text-sm text-[#6F6B60] mb-5">
              Nothing booked yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-5">
              {sessions.map((s) => (
                <SessionRowLink key={s.id} s={s} />
              ))}
            </div>
          )}
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 border border-[#E8E2D6] rounded-full px-4 py-2 font-dm-sans text-sm text-[#18150F] hover:bg-[#FBF7EE] transition-colors"
          >
            All sessions <ChevronRight size={14} />
          </Link>
        </div>

        {/* Messages */}
        <div className="border border-[#E8E2D6] rounded-xl p-6 flex flex-col">
          <p className="font-dm-sans text-xs text-[#6F6B60] mb-1">Messages</p>
          <p className="font-dm-sans text-sm text-[#18150F] mb-3">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
          <p className="font-dm-sans text-sm text-[#6F6B60] mb-5 flex-1">
            Your conversation with each mentor opens automatically when you
            book a session.
          </p>
          <Link
            href="/messages"
            className="w-full bg-[#2596BE] text-white font-dm-sans text-sm py-2.5 rounded-full hover:bg-[#1A7A9E] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} /> Open messages
          </Link>
        </div>
      </div>
    </div>
  );
}
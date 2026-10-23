import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CallRoom } from "@/features/video/components/call-room";
import { MessageThread } from "@/features/chat/components/message-thread";
import { isJoinable } from "@/lib/join-window";

/**
 * The video call page (P5-02). URL: /sessions/[id]/call
 * Layout: call stage + the existing chat thread as a sidebar (lg screens) —
 * the conversation between these two people already exists from booking.
 */

export default async function CallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const { data: s } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, mentor_id, learner_id, status, scheduled_at, ends_at,
       mentor:user!mentor_sessions_mentor_id_fkey(name),
       learner:user!mentor_sessions_learner_id_fkey(name)`
    )
    .eq("id", id)
    .maybeSingle();

  if (
    !s ||
    (s.mentor_id !== session.user.id && s.learner_id !== session.user.id)
  ) {
    notFound();
  }

  const row = s as unknown as {
    id: string;
    mentor_id: string;
    learner_id: string;
    status: string;
    scheduled_at: string;
    ends_at: string;
    mentor: { name: string } | null;
    learner: { name: string } | null;
  };

  // Server-side window check mirrors the token route
  if (!isJoinable(row.status, row.scheduled_at, row.ends_at)) {
    redirect(`/sessions/${id}`);
  }

  const isMentor = row.mentor_id === session.user.id;
  const counterpartName =
    (isMentor ? row.learner?.name : row.mentor?.name) ?? "Participant";

  // The conversation between the pair (created at booking, P6-03).
  // Two-step lookup: my conversations ∩ theirs.
  const { data: mine } = await supabaseAdmin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", session.user.id);

  let conversationId: string | null = null;
  if (mine && mine.length > 0) {
    const { data: shared } = await supabaseAdmin
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", isMentor ? row.learner_id : row.mentor_id)
      .in(
        "conversation_id",
        mine.map((m) => m.conversation_id)
      )
      .limit(1)
      .maybeSingle();
    conversationId = shared?.conversation_id ?? null;
  }

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-medium text-lf-ink">
          Session with {counterpartName}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <CallRoom sessionId={id} counterpartName={counterpartName} />

        {conversationId && (
          <aside className="hidden lg:flex flex-col rounded-2xl border border-lf-line bg-white p-4">
            <p className="mb-3 text-sm text-lf-muted">Chat</p>
            <MessageThread
              conversationId={conversationId}
              currentUserId={session.user.id}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
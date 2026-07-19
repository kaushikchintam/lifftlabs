import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CallRoom } from "@/features/video/components/call-room";
import { MessageThread } from "@/features/chat/components/message-thread";

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
  const session = await auth.api.getSession({ headers: await headers() });
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
  const now = Date.now();
  const opens = new Date(row.scheduled_at).getTime() - 15 * 60 * 1000;
  const closes = new Date(row.ends_at).getTime() + 30 * 60 * 1000;
  if (row.status !== "confirmed" || now < opens || now > closes) {
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
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-4">
        <h1 className="font-archivo-black text-xl text-[#18150F]">
          Session with {counterpartName}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <CallRoom sessionId={id} counterpartName={counterpartName} />

        {conversationId && (
          <aside className="hidden lg:block rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-4 flex flex-col">
            <p className="font-dm-sans text-xs text-[#6F6B60] mb-3">Chat</p>
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
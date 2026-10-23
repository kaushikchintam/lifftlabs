import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { roleOf } from "@/lib/auth/role";
import { MessageThread } from "@/features/chat/components/message-thread";
import { ArchiveButton } from "@/features/chat/components/archive-button";
import { Avatar, btnPrimary } from "@/components/ui/lifft";
import { intakesById, mentorHeadlines, rebookHref, sessionsFor } from "@/features/space/queries";
import { formatSession } from "@/utils/format-date";

/** Chat thread — /messages/[id]. Participants only. */
export default async function ThreadPage(props: PageProps<"/messages/[id]">) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  const { id } = await props.params;
  const userId = session.user.id;

  const { data: membership } = await supabaseAdmin
    .from("conversation_participants")
    .select("archived_at")
    .eq("conversation_id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) notFound();

  const { data: other } = await supabaseAdmin
    .from("conversation_participants")
    .select("user_id, user:user(name)")
    .eq("conversation_id", id)
    .neq("user_id", userId)
    .maybeSingle();
  const otherId = other?.user_id ?? "";
  const otherName = (other as unknown as { user: { name: string } | null })?.user?.name || "Conversation";

  const role = await roleOf(userId);
  const pair = (await sessionsFor(userId, role)).filter((s) => (role === "mentor" ? s.learnerId : s.mentorId) === otherId);
  const latest = pair[0];
  const upcoming = pair.filter((s) => s.status === "confirmed" && new Date(s.scheduledAt) > new Date()).at(-1);
  const headline = role === "learner" ? (await mentorHeadlines([otherId])).get(otherId) : null;
  const intake = latest?.intakeId ? (await intakesById([latest.intakeId])).get(latest.intakeId) : undefined;

  const subtitle = [headline, upcoming ? `next session ${formatSession(upcoming.scheduledAt)}` : null]
    .filter(Boolean)
    .join(" · ");

  const header = (
    <div className="flex flex-none items-center gap-4 border-b border-lf-line px-6 py-4">
      <Avatar name={otherName} id={otherId} size={56} />
      <div className="min-w-0 flex-1">
        <p className="text-[21px] font-semibold">{otherName}</p>
        {subtitle && <p className="truncate text-[17px] text-lf-muted">{subtitle}</p>}
      </div>
      {latest && role === "learner" && (
        <Link href={rebookHref(latest, intake, true)} className={btnPrimary}>Book again</Link>
      )}
      {latest && role === "mentor" && (
        <Link href={`/sessions/${(upcoming ?? latest).id}`} className={btnPrimary}>View brief</Link>
      )}
      <ArchiveButton conversationId={id} archived={!!membership.archived_at} />
    </div>
  );

  return (
    <MessageThread
      conversationId={id}
      currentUserId={userId}
      header={header}
      emptyText={`No messages yet. Ask ${otherName.split(" ")[0]} anything — before or between sessions.`}
    />
  );
}

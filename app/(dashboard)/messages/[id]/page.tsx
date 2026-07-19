import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MessageThread } from "@/features/chat/components/message-thread";

/** Chat thread — /messages/[id] (replaces the legacy page). */
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;

  // Participant check — outsiders get 404, same as nonexistence
  const { data: membership } = await supabaseAdmin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!membership) notFound();

  const { data: other } = await supabaseAdmin
    .from("conversation_participants")
    .select("user:user(name)")
    .eq("conversation_id", id)
    .neq("user_id", session.user.id)
    .maybeSingle();

  const counterpartName =
    (other as unknown as { user: { name: string } | null })?.user?.name || "Conversation";

  return (
    <MessageThread
      conversationId={id}
      currentUserId={session.user.id}
      counterpartName={counterpartName}
    />
  );
}
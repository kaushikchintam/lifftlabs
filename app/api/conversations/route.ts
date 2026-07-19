import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * GET /api/conversations — the current user's conversations, newest activity
 * first, with counterpart name and unread count. (Replaces the legacy route.)
 */

export async function GET(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = guard.session.user.id;

  // Conversations I'm in
  const { data: memberships, error } = await supabaseAdmin
    .from("conversation_participants")
    .select("conversation_id, conversation:conversations(id, last_message_at)")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const conversationIds = (memberships ?? []).map((m) => m.conversation_id);
  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  // Counterparts (the other participant in each 1:1 conversation)
  const { data: others } = await supabaseAdmin
    .from("conversation_participants")
    .select("conversation_id, user_id, user:user(name)")
    .in("conversation_id", conversationIds)
    .neq("user_id", userId);

  // Unread incoming messages, grouped client-side (fine at this scale)
  const { data: unread } = await supabaseAdmin
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  const unreadByConversation = new Map<string, number>();
  for (const m of unread ?? []) {
    unreadByConversation.set(
      m.conversation_id,
      (unreadByConversation.get(m.conversation_id) ?? 0) + 1
    );
  }

  const counterpartByConversation = new Map(
    (others ?? []).map((o) => [
      o.conversation_id,
      (o as unknown as { user: { name: string } | null }).user?.name || "—",
    ])
  );

  const conversations = (memberships ?? [])
    .map((m) => {
      const convo = m.conversation as unknown as {
        id: string;
        last_message_at: string | null;
      } | null;
      return {
        id: m.conversation_id,
        counterpartName: counterpartByConversation.get(m.conversation_id) || "—",
        lastMessageAt: convo?.last_message_at ?? null,
        unread: unreadByConversation.get(m.conversation_id) ?? 0,
      };
    })
    .sort((a, b) =>
      (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "")
    );

  return NextResponse.json({ conversations });
}
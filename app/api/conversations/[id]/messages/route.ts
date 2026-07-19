import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";
import { sendMessageDigest } from "@/lib/emails/message-digest";

/**
 * /api/conversations/[id]/messages (replaces the legacy route)
 *
 * GET  — two modes, both keyset (P6-04, never offset):
 *   ?before=<created_at>|<id>  → older history, DESC, limit 50 (scroll-up)
 *   ?after=<created_at>|<id>   → newer than cursor, ASC (the 3–5s poll)
 *   (no cursor)                → latest 50
 *   Side effect: incoming messages returned by the latest/after modes are
 *   marked read — fetching the thread IS reading it at MVP fidelity.
 *
 * POST — send. Leading-edge debounced email (P6-05): first message of a
 *   burst notifies the recipient immediately; repeats within the window are
 *   suppressed via conversations.last_notified_at.
 */

const PAGE_SIZE = 50;
const NOTIFY_DEBOUNCE_MINUTES = 15;

const sendSchema = z.object({ content: z.string().min(1).max(4000) });

async function assertParticipant(conversationId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

function parseCursor(raw: string | null): { ts: string; id: string } | null {
  if (!raw) return null;
  const [ts, id] = raw.split("|");
  return ts && id ? { ts, id } : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: conversationId } = await params;

  if (!(await assertParticipant(conversationId, guard.session.user.id))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const before = parseCursor(request.nextUrl.searchParams.get("before"));
  const after = parseCursor(request.nextUrl.searchParams.get("after"));

  let query = supabaseAdmin
    .from("messages")
    .select("id, sender_id, content, created_at, read_at")
    .eq("conversation_id", conversationId);

  if (after) {
    // Poll mode: strictly newer than the cursor, oldest-first for appending
    query = query
      .or(
        `created_at.gt.${after.ts},and(created_at.eq.${after.ts},id.gt.${after.id})`
      )
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(PAGE_SIZE);
  } else if (before) {
    // History mode: strictly older, newest-first (client reverses)
    query = query
      .or(
        `created_at.lt.${before.ts},and(created_at.eq.${before.ts},id.lt.${before.id})`
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(PAGE_SIZE);
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(PAGE_SIZE);
  }

  const { data: messages, error } = await query;
  if (error) {
    console.error("messages fetch failed:", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  // Mark incoming as read on latest/poll fetches (not history scrolls)
  if (!before && messages && messages.length > 0) {
    const incomingUnread = messages
      .filter((m) => m.sender_id !== guard.session.user.id && !m.read_at)
      .map((m) => m.id);
    if (incomingUnread.length > 0) {
      await supabaseAdmin
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", incomingUnread);
    }
  }

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: conversationId } = await params;
  const userId = guard.session.user.id;

  if (!(await assertParticipant(conversationId, userId))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: z.infer<typeof sendSchema>;
  try {
    body = sendSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data: message, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: body.content,
    })
    .select("id, sender_id, content, created_at, read_at")
    .single();

  if (error) {
    console.error("message insert failed:", error);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  await supabaseAdmin
    .from("conversations")
    .update({ last_message_at: message.created_at })
    .eq("id", conversationId);

  // P6-05 leading-edge debounce: notify at most once per window. The
  // conditional update is the atomic claim — only one concurrent sender wins.
  const windowStart = new Date(
    Date.now() - NOTIFY_DEBOUNCE_MINUTES * 60 * 1000
  ).toISOString();
  const { data: claimed } = await supabaseAdmin
    .from("conversations")
    .update({ last_notified_at: new Date().toISOString() })
    .eq("id", conversationId)
    .or(`last_notified_at.is.null,last_notified_at.lt.${windowStart}`)
    .select("id")
    .maybeSingle();

  if (claimed) {
    // Best-effort, never fails the send
    sendMessageDigest(conversationId, userId).catch((err) =>
      console.error("[email] digest failed:", err)
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}
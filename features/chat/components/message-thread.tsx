"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * P6-01/02/04 — the thread. Polling, not sockets (ADR 010: Better Auth
 * sessions can't authorize Supabase Realtime; polling through our own authed
 * API routes keeps one trust boundary). 4s cadence is indistinguishable from
 * live at 1:1 mentoring scale.
 */

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const POLL_MS = 4000;

function cursorOf(m: Message): string {
  return `${m.created_at}|${m.id}`;
}

export function MessageThread({
  conversationId,
  currentUserId,
  header,
  emptyText = "No messages yet. Say hello.",
}: {
  conversationId: string;
  currentUserId: string;
  /** Server-rendered header (avatar, name, actions). */
  header?: React.ReactNode;
  emptyText?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);  //two parts, generic type <Message[]> and the initial value ([])
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // Sync messages state to a ref to prevent polling interval teardowns
  const messagesRef = useRef<Message[]>(messages);  //create a ref to hold the live data
  useEffect(() => {
    messagesRef.current = messages;   // keep the ref perfectly updated whenever state changes
  }, [messages]);

  const base = `/api/conversations/${conversationId}/messages`;

  // Initial: latest page (arrives newest-first; reverse for display)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(base);
        if (res.ok && active) {
          const { messages: page } = await res.json();
          setMessages([...page].reverse());
          setHasMore(page.length === 50);
        }
      } catch (error) {
        console.error("Initial load failed:", error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [base]);

  // Poll for newer than the newest we hold
  useEffect(() => {
    const timer = setInterval(async () => {
      // Always pulls the latest message state out of the stable mutable ref
      const currentMessages = messagesRef.current;
      const newest = currentMessages[currentMessages.length - 1];
      const url = newest ? `${base}?after=${encodeURIComponent(cursorOf(newest))}` : base;

      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const { messages: fresh } = await res.json();
        if (fresh.length === 0) return;

        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const additions = (newest ? fresh : [...fresh].reverse()).filter(
            (m: Message) => !seen.has(m.id)
          );
          return additions.length ? [...prev, ...additions] : prev;
        });
      } catch (error) {
        // Safe catch handler to silence uncaught client side "Failed to Fetch" exceptions
        console.error("Message polling network dropout:", error);
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [base]); // Removed variable "messages" array dependency

  // Scroll-up history (keyset ?before=)
  const loadOlder = useCallback(async () => {
    const oldest = messages[0];
    if (!oldest) return;
    try {
      const res = await fetch(
        `${base}?before=${encodeURIComponent(cursorOf(oldest))}`
      );
      if (!res.ok) return;
      const { messages: page } = await res.json();
      setHasMore(page.length === 50);
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const older = [...page].reverse().filter((m: Message) => !seen.has(m.id));
        return older.length ? [...older, ...prev] : prev;
      });
    } catch (error) {
      console.error("Failed to fetch older history:", error);
    }
  }, [base, messages]);

  useEffect(() => {
    if (stickToBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function send() {
    const content = draft.trim();
    if (!content) return;
    setDraft("");

    // Optimistic append; reconcile by real id when the response lands
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const { message } = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === tempId ? message : m)));
      } else {
        throw new Error("Server rejected message");
      }
    } catch (error) {
      console.error("Message dispatch failure:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(content); // give it back for retry
    }
  }

  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[15px] text-lf-muted">Loading messages…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {header}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-transparent"
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={loadOlder}
              className="text-[13px] text-lf-muted hover:text-lf-ink"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-[17px] text-lf-muted">{emptyText}</p>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[72%] flex-col ${mine ? "items-end" : "items-start"} gap-1`}>
                <div
                  className={`px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-lf-ink text-white rounded-2xl rounded-br-sm"
                      : "bg-lf-soft border border-lf-line text-lf-ink rounded-2xl rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-[15px]">{m.content}</p>
                </div>
                <p className="px-1 text-[11px] text-lf-muted">
                  {timeFmt.format(new Date(m.created_at))}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        className="flex flex-none gap-3 border-t border-lf-line px-6 py-5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message"
          maxLength={4000}
          className="flex-1 rounded-xl border border-lf-line-strong px-4 py-3 text-[17px] outline-none placeholder:text-[#9A9A9A] focus:border-lf-ink"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-xl bg-lf-ink px-6 text-[17px] font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

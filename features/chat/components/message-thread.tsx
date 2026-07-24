"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function MessageThread({
  conversationId,
  currentUserId,
  counterpartName,
}: {
  conversationId: string;
  currentUserId: string;
  counterpartName?: string;
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
        <p className="font-dm-sans text-sm text-[#6F6B60]">Loading messages…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {counterpartName && (
        <div className="flex-none border-b border-white/40 bg-white/60 backdrop-blur-sm px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#18150F] flex items-center justify-center">
            <span className="font-dm-sans text-xs font-semibold text-white">
              {initials(counterpartName)}
            </span>
          </div>
          <p className="font-dm-sans font-semibold text-[#18150F]">{counterpartName}</p>
        </div>
      )}

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
              className="font-dm-sans text-xs text-[#6F6B60] hover:text-[#18150F] transition-colors"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-dm-sans text-sm text-[#6F6B60]">
              No messages yet — say hello.
            </p>
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
                      ? "bg-[#18150F] text-[#FBF7EE] rounded-2xl rounded-br-sm"
                      : "bg-[#FBF7EE] border border-[#E8E2D6] text-[#18150F] rounded-2xl rounded-bl-sm"
                  }`}
                >
                  <p className="font-dm-sans whitespace-pre-wrap break-words">{m.content}</p>
                </div>
                <p className="font-dm-sans text-[10px] text-[#9A958A] px-1">
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
        className="flex-none border-t border-white/30 bg-white/60 backdrop-blur-md px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message here…"
            maxLength={4000}
            className="flex-1 bg-transparent font-dm-sans text-sm text-[#18150F] placeholder:text-[#9A958A] outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2596BE] text-white disabled:opacity-40 hover:bg-[#1A7A9E] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

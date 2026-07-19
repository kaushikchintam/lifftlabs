"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Conversation {
  id: string;
  counterpartName: string;
  lastMessageAt: string | null;
  unread: number;
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/conversations");
      setConversations(res.ok ? (await res.json()).conversations : []);
    })();
  }, []);

  if (conversations === null) {
    return (
      <p className="px-5 py-3 font-dm-sans text-sm text-[#6F6B60]">Loading…</p>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="px-5 py-3 font-dm-sans text-sm text-[#6F6B60]">
        No conversations yet — one opens automatically with your first booked session.
      </p>
    );
  }

  const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

  return (
    <div>
      {conversations.map((c) => {
        const active = pathname === `/messages/${c.id}`;
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              active ? "bg-[#EDE8DC]" : "hover:bg-[#EDE8DC]/60"
            }`}
          >
            {/* Avatar */}
            <div className="h-10 w-10 flex-none rounded-full bg-[#18150F] flex items-center justify-center">
              <span className="font-dm-sans text-xs font-semibold text-white">
                {initials(c.counterpartName)}
              </span>
            </div>
            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-dm-sans text-sm truncate ${active ? "font-semibold" : "font-medium"} text-[#18150F]`}>
                  {c.counterpartName}
                </p>
                {c.lastMessageAt && (
                  <p className="font-dm-sans text-[11px] text-[#6F6B60] flex-none">
                    {dateFmt.format(new Date(c.lastMessageAt))}
                  </p>
                )}
              </div>
              {c.unread > 0 && (
                <span className="mt-0.5 inline-flex items-center rounded-full bg-[#2596BE] px-2 py-0.5 font-dm-sans text-[10px] font-semibold text-white">
                  {c.unread} new
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
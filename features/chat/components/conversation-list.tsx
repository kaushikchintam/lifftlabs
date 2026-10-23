"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/lifft";
import { formatSession } from "@/utils/format-date";

interface Conversation {
  id: string;
  counterpartId: string;
  counterpartName: string;
  journeyTitle: string | null;
  nextSessionAt: string | null;
  archived: boolean;
  lastMessageAt: string | null;
  unread: number;
}

type Filter = "all" | "unread" | "archived";

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/conversations");
      setConversations(res.ok ? (await res.json()).conversations : []);
    })();
  }, [pathname]); // refetch after archive/unarchive navigates

  const shown = (conversations ?? []).filter((c) =>
    filter === "archived" ? c.archived : !c.archived && (filter === "all" || c.unread > 0)
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex gap-2 border-b border-lf-line px-4">
        {(["all", "unread", "archived"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border-b-[3px] px-3 py-4 text-[19px] capitalize ${
              filter === f ? "border-lf-ink text-lf-ink" : "border-transparent text-lf-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations === null ? (
          <p className="px-6 py-4 text-[15px] text-lf-muted">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="px-6 py-4 text-[15px] text-lf-muted">
            {filter === "all" ? "No conversations yet. One opens with your first booked session." : `Nothing ${filter}.`}
          </p>
        ) : (
          shown.map((c) => {
            const active = pathname === `/messages/${c.id}`;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={`flex items-center gap-4 border-b border-lf-line px-6 py-5 ${active ? "bg-lf-soft" : "hover:bg-lf-soft/60"}`}
              >
                <Avatar name={c.counterpartName} id={c.counterpartId} size={60} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[19px] font-semibold">{c.counterpartName}</p>
                    {c.unread > 0 && (
                      <span className="rounded-full bg-lf-ink px-2 py-0.5 text-[12px] font-semibold text-white">{c.unread}</span>
                    )}
                  </div>
                  {c.journeyTitle && <p className="truncate text-[15px] text-lf-muted">{c.journeyTitle}</p>}
                  {c.nextSessionAt && (
                    <p className="truncate text-[17px] text-lf-body">Next session {formatSession(c.nextSessionAt)}</p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

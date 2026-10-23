"use client";

import { useState } from "react";
import Link from "next/link";
import { inputCls } from "@/components/ui/lifft";

/** "Message Jordan Hale" on Home — a one-line compose into the existing thread. */
export function QuickMessageCard({ conversationId, name }: { conversationId: string; name: string }) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border border-lf-line bg-white p-7">
      <h2 className="text-[23px] font-medium">Message {name}</h2>
      <p className="mb-5 text-[17px] text-lf-muted">
        {sent ? (
          <>
            Sent. <Link href={`/messages/${conversationId}`} className="underline">Open the conversation</Link>
          </>
        ) : (
          "Ask anything before you meet."
        )}
      </p>
      <form
        className="flex gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const content = draft.trim();
          if (!content) return;
          setBusy(true);
          const res = await fetch(`/api/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
          setBusy(false);
          if (res.ok) {
            setDraft("");
            setSent(true);
          }
        }}
      >
        <input className={inputCls} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message" maxLength={4000} />
        <button className="rounded-xl bg-lf-ink px-6 text-[17px] font-medium text-white disabled:opacity-50" disabled={busy || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

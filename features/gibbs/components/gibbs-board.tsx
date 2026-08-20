"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { ReflectionForm, type ReflectionDraft } from "./reflection-form";

interface PendingSession {
  session_id: string;
  mentor_name: string;
  scheduled_at: string;
}

interface Reflection {
  id: string;
  session_id: string | null;
  mentor_name: string | null;
  title: string | null;
  description: string;
  feelings: string;
  evaluation: string;
  analysis: string;
  conclusion: string;
  action_plan: string;
  created_at: string;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const DISMISSED_KEY = "lift-gibbs-dismissed-sessions";

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function GibbsBoard() {
  const [pending, setPending] = useState<PendingSession[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<PendingSession | null>(null);
  const [activeReflection, setActiveReflection] = useState<Reflection | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    const [pendingRes, listRes] = await Promise.all([fetch("/api/gibbs/pending"), fetch("/api/gibbs")]);
    if (pendingRes.ok) setPending((await pendingRes.json()).pending);
    if (listRes.ok) setReflections((await listRes.json()).reflections);
    setDismissed(readDismissed());
  }, []);

  function handleDismiss(sessionId: string) {
    const next = new Set(dismissed);
    next.add(sessionId);
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
  }

  const visiblePending = pending.filter((s) => !dismissed.has(s.session_id));

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  async function handleDelete(id: string) {
    await fetch(`/api/gibbs/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-6">
      {visiblePending.length > 0 && (
        <div className="rounded-2xl bg-brand-tint/40 border border-brand-tint p-5">
          <h4 className="font-dm-sans font-semibold text-ink">Sessions waiting for a reflection</h4>
          <div className="mt-3 space-y-2">
            {visiblePending.map((s) => (
              <div key={s.session_id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <span className="font-dm-sans text-sm text-ink">
                  Session with {s.mentor_name} · {dateFmt.format(new Date(s.scheduled_at))}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSession(s)}
                    className="rounded-full bg-brand px-4 py-1.5 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
                  >
                    Reflect
                  </button>
                  <button
                    onClick={() => handleDismiss(s.session_id)}
                    title="Don't ask me to reflect on this session"
                    className="text-ink-faintest hover:text-ink transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-dm-serif text-2xl text-ink">Your reflections</h3>
        <button onClick={() => setShowNew(true)} className="rounded-full bg-brand px-4 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover transition-colors">
          + New reflection
        </button>
      </div>

      {loading ? (
        <p className="font-dm-sans text-sm text-ink-muted">Loading…</p>
      ) : reflections.length === 0 ? (
        <p className="font-dm-sans text-sm text-ink-muted">Nothing logged yet — reflect on a session above, or start a freeform one.</p>
      ) : (
        <div className="space-y-3">
          {reflections.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <button onClick={() => setActiveReflection(r)} className="flex-1 text-left">
                  <p className="font-dm-sans font-semibold text-ink">{r.title ?? "Session reflection"}</p>
                  <p className="mt-1 font-dm-sans text-sm text-ink-muted">{dateFmt.format(new Date(r.created_at))}</p>
                  <p className="mt-2 font-dm-sans text-sm text-ink-body line-clamp-2">{r.description}</p>
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-ink-faintest hover:text-ink transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSession && (
        <ReflectionForm
          sessionMeta={activeSession}
          onClose={() => setActiveSession(null)}
          onSaved={refresh}
        />
      )}

      {activeReflection && (
        <ReflectionForm
          initial={activeReflection as ReflectionDraft}
          sessionMeta={
            activeReflection.session_id
              ? {
                  session_id: activeReflection.session_id,
                  mentor_name: activeReflection.mentor_name ?? "your mentor",
                  scheduled_at: activeReflection.created_at,
                }
              : undefined
          }
          onClose={() => setActiveReflection(null)}
          onSaved={refresh}
        />
      )}

      {showNew && <ReflectionForm onClose={() => setShowNew(false)} onSaved={refresh} />}
    </div>
  );
}

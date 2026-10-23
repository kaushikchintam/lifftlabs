"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, CheckCircle2 } from "lucide-react";
import { KINDS, getJourney, tagLabel } from "@/features/journeys/config";
import { btnPrimary, btnSecondary } from "@/components/ui/lifft";
import { formatPence } from "@/utils/format-date";

export const CHECKS = [
  ["identity", "Identity"],
  ["registration", "Registration or qualification"],
  ["insurance", "Insurance"],
  ["references", "References"],
] as const;

export interface Application {
  id: string;
  full_name: string;
  email: string;
  linkedin_url: string;
  role_title: string | null;
  price_pence: number | null;
  journeys: string[];
  tags: string[];
  credentials: string | null;
  lived_experience: string | null;
  checks: Record<string, { by: string; at: string }>;
  created_at: string;
}

export function ApplicationCard({ app }: { app: Application }) {
  const router = useRouter();
  const [checks, setChecks] = useState(app.checks);
  const [kind, setKind] = useState("mentor");
  const [busy, setBusy] = useState(false);
  const allChecked = CHECKS.every(([k]) => checks[k]);
  const days = Math.floor((Date.now() - new Date(app.created_at).getTime()) / 86_400_000);

  async function toggle(key: string) {
    const res = await fetch(`/api/admin/applications/${app.id}/checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, done: !checks[key] }),
    });
    if (res.ok) setChecks((await res.json()).checks);
  }

  async function decide(path: "approve" | "reject") {
    setBusy(true);
    await fetch(`/api/mentors/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: app.id, kind }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border-2 border-lf-ink bg-white p-7">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:justify-between">
        <div>
          <p className="text-[15px] font-medium tracking-[0.08em] text-[#755D1B]">
            NEW APPLICATION · {days === 0 ? "TODAY" : `${days}D AGO`}
          </p>
          <p className="text-[23px] font-medium">
            {app.full_name}
            {app.role_title ? ` · ${app.role_title}` : ""}
          </p>
          <p className="text-[17px] text-lf-muted">
            {[
              app.journeys.map((j) => getJourney(j)?.title ?? j).join(", "),
              app.price_pence ? formatPence(app.price_pence) : null,
              app.linkedin_url,
              app.email,
            ].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex flex-none items-start gap-3">
          <select
            className="rounded-xl border border-lf-line-strong bg-white px-3 py-2.5 text-[16px]"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Mentor kind"
          >
            {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className={btnSecondary} disabled={busy} onClick={() => decide("reject")}>Reject</button>
          <button className={btnPrimary} disabled={busy || !allChecked} onClick={() => decide("approve")}>Approve</button>
        </div>
      </div>

      <div className="mb-5 grid gap-5 md:grid-cols-3">
        <div>
          <p className="font-medium">Credentials</p>
          <p className="text-[17px] text-lf-body">{app.credentials || "—"}</p>
        </div>
        <div>
          <p className="font-medium">Lived experience</p>
          <p className="text-[17px] text-lf-body">{app.lived_experience || "—"}</p>
        </div>
        <div>
          <p className="font-medium">Topics</p>
          <p className="text-[17px] text-lf-body">{app.tags.map(tagLabel).join(", ") || "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-lf-line pt-5">
        <span className="text-[17px] text-lf-muted">Checks</span>
        {CHECKS.map(([key, label]) => {
          const done = checks[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              title={done ? `${done.by} · ${new Date(done.at).toLocaleDateString("en-GB")}` : "Mark as checked"}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[16px] ${
                done ? "border-[#197550] bg-[#D9F2E5] text-[#197550]" : "border-lf-line-strong"
              }`}
            >
              {done ? <CheckCircle2 size={16} /> : <Circle size={16} />} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Role-aware settings form. Loads GET /api/users/me, edits via PATCH,
 * avatar via POST /api/users/me/avatar. Mentors additionally get
 * "Manage payouts" → Stripe Express Dashboard login link.
 * Styled in the dashboard's design language (archivo-black / dm-sans).
 */

interface Me {
  user: { name: string; email: string; image: string | null };
  role: "mentor" | "learner";
  mentorProfile: {
    one_liner: string | null;
    current_position: string | null;
    specialty: string[] | null;
    hourly_rate_pence: number | null;
    charges_enabled: boolean;
  } | null;
  learnerProfile: {
    current_position: string | null;
    target_role: string | null;
    linkedin_url: string | null;
  } | null;
}

const inputCls =
  "w-full rounded-lg border border-[#E8E2D6] bg-white px-3 py-2 font-dm-sans text-sm text-[#18150F] outline-none focus:border-[#2596BE]";
const labelCls = "font-dm-sans text-xs text-[#6F6B60] mb-1 block";

export function SettingsForm({ hasStripeAccount }: { hasStripeAccount: boolean }) {
  const [me, setMe] = useState<Me | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Editable state
  const [name, setName] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) return;
      const data: Me = await res.json();
      setMe(data);
      setName(data.user.name);
      setCurrentPosition(
        data.mentorProfile?.current_position ??
          data.learnerProfile?.current_position ??
          ""
      );
      setTargetRole(data.learnerProfile?.target_role ?? "");
      setLinkedin(data.learnerProfile?.linkedin_url ?? "");
      setOneLiner(data.mentorProfile?.one_liner ?? "");
      setSpecialty(data.mentorProfile?.specialty?.[0] ?? "");
      setRate(
        data.mentorProfile?.hourly_rate_pence != null
          ? String(data.mentorProfile.hourly_rate_pence / 100)
          : ""
      );
    })();
  }, []);

  async function save() {
    if (!me) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    const body =
      me.role === "mentor"
        ? {
            name,
            one_liner: oneLiner,
            current_position: currentPosition,
            specialty,
            ...(rate ? { hourly_rate_pounds: parseInt(rate, 10) } : {}),
          }
        : {
            name,
            current_position: currentPosition,
            target_role: targetRole,
            linkedin_url: linkedin,
          };

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError("Couldn't save — check the fields and try again.");
    }
    setSaving(false);
  }

  async function uploadAvatar(file: File) {
    setAvatarBusy(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/users/me/avatar", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const { url } = await res.json();
      setMe((prev) =>
        prev ? { ...prev, user: { ...prev.user, image: url } } : prev
      );
    } else {
      const body = await res.json().catch(() => ({}));
      setError(
        body.error === "too_large"
          ? "Image too large — 2 MB max."
          : body.error === "unsupported_type"
            ? "Use a JPG, PNG, or WebP image."
            : "Upload failed — try again."
      );
    }
    setAvatarBusy(false);
  }

  async function managePayouts() {
    const res = await fetch("/api/mentor/stripe/manage", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.open(url, "_blank", "noopener");
    } else {
      setError("Couldn't open Stripe — try again in a moment.");
    }
  }

  if (!me) {
    return <p className="font-dm-sans text-sm text-[#6F6B60]">Loading…</p>;
  }

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar + identity */}
      <section className="border border-[#E8E2D6] rounded-xl p-6">
        <p className="font-dm-sans text-xs text-[#6F6B60] mb-4">Profile</p>

        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {me.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.user.image}
                alt="Your avatar"
                className="w-16 h-16 rounded-full object-cover border border-[#E8E2D6]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#18150F] flex items-center justify-center">
                <span className="font-dm-sans text-white text-lg">{initials}</span>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarBusy}
              className="border border-[#E8E2D6] rounded-full px-4 py-2 font-dm-sans text-sm text-[#18150F] hover:bg-[#FBF7EE] transition-colors disabled:opacity-50"
            >
              {avatarBusy ? "Uploading…" : "Change photo"}
            </button>
            <p className="font-dm-sans text-xs text-[#6F6B60] mt-1">
              JPG, PNG or WebP, up to 2 MB.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={`${inputCls} opacity-60`} value={me.user.email} disabled />
            <p className="font-dm-sans text-xs text-[#6F6B60] mt-1">
              Your sign-in email can't be changed here.
            </p>
          </div>
        </div>
      </section>

      {/* Role-specific fields */}
      <section className="border border-[#E8E2D6] rounded-xl p-6">
        <p className="font-dm-sans text-xs text-[#6F6B60] mb-4">
          {me.role === "mentor" ? "Mentor profile" : "Your journey"}
        </p>

        {me.role === "mentor" ? (
          <div className="grid gap-4">
            <div>
              <label className={labelCls}>One-liner (shown to learners)</label>
              <input
                className={inputCls}
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                maxLength={300}
                placeholder="e.g. Paramedic → Medical student, happy to talk GAMSAT and applications"
              />
            </div>
            <div>
              <label className={labelCls}>Current position</label>
              <input
                className={inputCls}
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                maxLength={200}
              />
            </div>
            <div>
              <label className={labelCls}>Specialty</label>
              <input
                className={inputCls}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label className={labelCls}>Session rate (£)</label>
              <input
                className={inputCls}
                type="number"
                min={10}
                max={500}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <p className="font-dm-sans text-xs text-[#6F6B60] mt-1">
                Per 60-minute session, before the 15% platform fee. Applies to
                new bookings only.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <label className={labelCls}>Current position</label>
              <input
                className={inputCls}
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                maxLength={200}
              />
            </div>
            <div>
              <label className={labelCls}>Target role</label>
              <input
                className={inputCls}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                maxLength={200}
              />
            </div>
            <div>
              <label className={labelCls}>LinkedIn (optional)</label>
              <input
                className={inputCls}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/…"
                maxLength={300}
              />
            </div>
          </div>
        )}
      </section>

      {/* Mentor payouts */}
      {me.role === "mentor" && hasStripeAccount && (
        <section className="border border-[#E8E2D6] rounded-xl p-6">
          <p className="font-dm-sans text-xs text-[#6F6B60] mb-2">Payouts</p>
          <p className="font-dm-sans text-sm text-[#18150F] mb-4">
            Payout history and bank details live in your Stripe dashboard —
            LIFFT never sees your bank information.
          </p>
          <button
            onClick={managePayouts}
            className="border border-[#E8E2D6] rounded-full px-4 py-2 font-dm-sans text-sm text-[#18150F] hover:bg-[#FBF7EE] transition-colors"
          >
            Manage payouts in Stripe
          </button>
        </section>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="bg-[#18150F] text-white font-dm-sans text-sm px-6 py-2.5 rounded-full hover:bg-[#2d2a22] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="font-dm-sans text-sm text-emerald-700">Saved.</span>
        )}
        {error && (
          <span className="font-dm-sans text-sm text-red-700">{error}</span>
        )}
      </div>
    </div>
  );
}
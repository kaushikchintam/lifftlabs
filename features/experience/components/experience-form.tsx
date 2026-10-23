"use client";

import { useRef, useState } from "react";
import {
  EXPERIENCE_KINDS,
  SETTINGS,
  FREQUENCY_UNITS,
  type ExperienceKind,
  type ExperienceSetting,
  type FrequencyUnit,
} from "./data/experience-options";

const MAX_PHOTOS = 4;

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-lf-ink text-white" : "border border-lf-line bg-white text-lf-ink hover:border-lf-ink"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-xl border border-lf-line-strong bg-white px-4 py-3 text-[15px] text-lf-ink outline-none placeholder:text-[#9A9A9A] focus:border-lf-ink";
const labelCls =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-lf-muted";

export function ExperienceForm({
  onDone,
  onCancel,
}: {
  onDone: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [expType, setExpType] = useState<ExperienceKind>("shadowing");
  const [customExpType, setCustomExpType] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [locationSite, setLocationSite] = useState("");
  const [setting, setSetting] = useState<ExperienceSetting>("in_person");
  const [durationNote, setDurationNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [hoursPerPeriod, setHoursPerPeriod] = useState("");
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>("week");
  const [headStartHours, setHeadStartHours] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [evidence, setEvidence] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const evidenceRef = useRef<HTMLInputElement>(null);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, MAX_PHOTOS));
  }

  function addEvidence(files: FileList | null) {
    if (!files) return;
    setEvidence((prev) => [...prev, ...Array.from(files)].slice(0, MAX_PHOTOS));
  }

  async function save() {
    setError(null);

    if (!organisation.trim() || !locationSite.trim() || !startDate) {
      setError("Organisation, location, and start date are required.");
      return;
    }
    if (expType === "other" && !customExpType.trim()) {
      setError("Describe the experience type.");
      return;
    }
    if (isRecurring && (!hoursPerPeriod || !frequencyUnit)) {
      setError("Recurring entries need hours per period and a frequency.");
      return;
    }
    if (!isRecurring && !totalHours) {
      setError("Total hours are required for a one-off entry.");
      return;
    }

    setSaving(true);

    const body = {
      exp_type: expType,
      custom_exp_type: expType === "other" ? customExpType.trim() : undefined,
      activity_description: activityDescription.trim() || undefined,
      organisation: organisation.trim(),
      location_site: locationSite.trim(),
      setting,
      duration_note: durationNote.trim() || undefined,
      supervisor: supervisor.trim() || undefined,
      evidence_reference: evidenceReference.trim() || undefined,
      is_recurring: isRecurring,
      start_date: startDate,
      end_date: endDate || undefined,
      ...(isRecurring
        ? {
            hours_per_period: Number(hoursPerPeriod),
            frequency_unit: frequencyUnit,
            head_start_hours: headStartHours ? Number(headStartHours) : undefined,
          }
        : { total_hours: Number(totalHours) }),
    };

    const res = await fetch("/api/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setSaving(false);
      setError("Couldn't save — check the fields and try again.");
      return;
    }

    const { log } = await res.json();

    // Attachments go one request per file, after the log exists — a failed
    // upload doesn't undo the log entry, which is already valid without it.
    for (const file of photos) {
      const form = new FormData();
      form.append("kind", "photo");
      form.append("file", file);
      await fetch(`/api/experience/${log.id}/attachments`, { method: "POST", body: form }).catch(
        () => null
      );
    }
    for (const file of evidence) {
      const form = new FormData();
      form.append("kind", "evidence");
      form.append("file", file);
      await fetch(`/api/experience/${log.id}/attachments`, { method: "POST", body: form }).catch(
        () => null
      );
    }

    setSaving(false);
    await onDone();
  }

  return (
    <div className="rounded-2xl border border-lf-line bg-white p-7">
      <div>
        <span className={labelCls}>Experience type</span>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_KINDS.map((k) => (
            <Pill key={k.value} active={expType === k.value} onClick={() => setExpType(k.value)}>
              {k.label}
            </Pill>
          ))}
        </div>
        {expType === "other" && (
          <input
            className={`${inputCls} mt-2`}
            placeholder="Describe the experience type"
            value={customExpType}
            onChange={(e) => setCustomExpType(e.target.value)}
          />
        )}
      </div>

      <div className="mt-4">
        <label className={labelCls}>What did you see or do?</label>
        <input
          className={inputCls}
          placeholder="e.g. GP shadowing — chronic care clinics"
          value={activityDescription}
          onChange={(e) => setActivityDescription(e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Organisation</label>
          <input
            className={inputCls}
            placeholder="e.g. Riverside Surgery"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Location / site</label>
          <input
            className={inputCls}
            placeholder="e.g. Kingston, London"
            value={locationSite}
            onChange={(e) => setLocationSite(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className={labelCls}>Remote / in person</span>
          <div className="flex gap-2">
            {SETTINGS.map((s) => (
              <Pill key={s.value} active={setting === s.value} onClick={() => setSetting(s.value)}>
                {s.label}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Duration</label>
          <input
            className={inputCls}
            placeholder="e.g. half-day clinics, 1 week"
            value={durationNote}
            onChange={(e) => setDurationNote(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <span className={labelCls}>Frequency</span>
        <div className="flex flex-wrap items-center gap-2">
          <Pill active={!isRecurring} onClick={() => setIsRecurring(false)}>
            One-off
          </Pill>
          <Pill active={isRecurring} onClick={() => setIsRecurring(true)}>
            Recurring
          </Pill>

          {!isRecurring ? (
            <>
              <span className="text-sm text-lf-muted">started</span>
              <input
                type="date"
                className={`${inputCls} w-auto`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-sm text-lf-muted">to</span>
              <input
                type="date"
                className={`${inputCls} w-auto`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Total hrs"
                className={`${inputCls} w-28`}
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
              />
            </>
          ) : (
            <>
              <span className="text-sm text-lf-muted">started</span>
              <input
                type="date"
                className={`${inputCls} w-auto`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="number"
                min={0}
                placeholder="Hrs"
                className={`${inputCls} w-20`}
                value={hoursPerPeriod}
                onChange={(e) => setHoursPerPeriod(e.target.value)}
              />
              <span className="text-sm text-lf-muted">every</span>
              {FREQUENCY_UNITS.map((f) => (
                <Pill
                  key={f.value}
                  active={frequencyUnit === f.value}
                  onClick={() => setFrequencyUnit(f.value)}
                >
                  {f.label}
                </Pill>
              ))}
              <input
                type="number"
                min={0}
                placeholder="Head start hrs"
                className={`${inputCls} w-32`}
                value={headStartHours}
                onChange={(e) => setHeadStartHours(e.target.value)}
              />
              <span className="text-sm text-lf-muted">until</span>
              <input
                type="date"
                className={`${inputCls} w-auto`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <span className="text-xs text-lf-muted">(leave blank if ongoing)</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Supervisor</label>
          <input
            className={inputCls}
            placeholder="Name and role"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Evidence / reference</label>
          <input
            className={inputCls}
            placeholder="e.g. signed letter, coordinator email"
            value={evidenceReference}
            onChange={(e) => setEvidenceReference(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <span className={labelCls}>Photos (optional)</span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            className="rounded-full border border-lf-line bg-white px-4 py-2 text-sm font-semibold text-lf-ink transition-colors hover:border-lf-ink disabled:opacity-50"
          >
            + Add up to 4 photos
          </button>
          <p className="text-sm text-lf-muted">
            Wards, teams, your badge — great memory-joggers for interviews
          </p>
        </div>
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((file, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-lf-line bg-white px-3 py-1 text-xs text-lf-muted"
              >
                {file.name}
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                  className="text-lf-muted hover:text-[#B42318]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-4">
        <span className={labelCls}>Evidence (optional)</span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => evidenceRef.current?.click()}
            disabled={evidence.length >= MAX_PHOTOS}
            className="rounded-full border border-lf-line bg-white px-4 py-2 text-sm font-semibold text-lf-ink transition-colors hover:border-lf-ink disabled:opacity-50"
          >
            + Add up to 4 files
          </button>
          <p className="text-sm text-lf-muted">
            Signed letters, certificates, coordinator emails — PDF or image
          </p>
        </div>
        {evidence.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {evidence.map((file, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-lf-line bg-white px-3 py-1 text-xs text-lf-muted"
              >
                {file.name}
                <button
                  type="button"
                  onClick={() => setEvidence((prev) => prev.filter((_, j) => j !== i))}
                  className="text-lf-muted hover:text-[#B42318]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={evidenceRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => {
            addEvidence(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-4 text-sm text-[#B42318]">{error}</p>}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-lf-muted transition-colors hover:text-lf-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-lf-ink px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save to log"}
        </button>
      </div>
    </div>
  );
}

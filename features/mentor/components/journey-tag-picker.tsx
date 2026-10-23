"use client";

import { JOURNEYS, tagLabel, topicsFor } from "@/features/journeys/config";

const label = "mb-2 block text-[15px] font-medium";
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Journey chips, then the topic chips those journeys allow. Shared by apply + edit profile. */
export function JourneyTagPicker({
  journeys,
  tags,
  onJourneys,
  onTags,
}: {
  journeys: string[];
  tags: string[];
  onJourneys: (j: string[]) => void;
  onTags: (t: string[]) => void;
}) {
  const topics = topicsFor(journeys);
  return (
    <>
      <p className={`${label} mt-6`}>Journeys you can help with</p>
      <div className="flex flex-wrap gap-2">
        {JOURNEYS.map((j) => {
          const on = journeys.includes(j.slug);
          return (
            <button
              key={j.slug}
              type="button"
              aria-pressed={on}
              onClick={() => onJourneys(toggle(journeys, j.slug))}
              className="rounded-full border px-4 py-2 text-[15px]"
              style={on ? { background: j.accent.light, borderColor: j.accent.dark } : { borderColor: "#E0E0E0" }}
            >
              {j.title}
            </button>
          );
        })}
      </div>

      {topics.length > 0 && (
        <>
          <p className={`${label} mt-6`}>
            Topics <span className="font-normal text-lf-muted">· these are what learners get matched on</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onTags(toggle(tags, t))}
                  className={`rounded-full border px-4 py-1.5 text-[15px] ${on ? "border-lf-ink bg-lf-ink text-white" : "border-lf-line-strong"}`}
                >
                  {tagLabel(t)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

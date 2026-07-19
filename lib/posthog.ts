"use client";

import posthog from "posthog-js"; // npm i posthog-js

/**
 * CX-02 — PostHog, EU cloud, consent-gated. Never call posthog.init at
 * module load: enableAnalytics() is invoked by the cookie banner only after
 * the user accepts (or on load when consent was previously granted).
 */

let initialised = false;

export function enableAnalytics() {
  if (initialised || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: "https://eu.i.posthog.com", // EU data residency
    person_profiles: "identified_only",
    capture_pageview: true,
  });
  initialised = true;
}

export { posthog };
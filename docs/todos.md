# LIFFT — Consolidated TODO (from architecture review, 2026-07-09)

Ordered by sequence. Work top to bottom; items within a section are roughly ordered too.
Companion to `tickets.md` — this captures review findings + decisions, not just features.

---

## 0 — Today / this week (protects everything else)

- [ ] **Push codebase to GitHub (CX-06).** Before pushing: confirm `.env*` gitignored,
      scan full git history for committed secrets. If ANY key was ever committed, rotate it
      (Google client secret, Supabase service role, Stripe keys, Resend).
- [ ] **Verify RLS state** — ADR 010 says "enabled, no policies"; db-schema.md says "disabled".
      Run: `select tablename, rowsecurity from pg_tables where schemaname='public';`
      Enable RLS (no policies) on anything false. `calendar_integrations` holds plaintext
      refresh tokens — if RLS is off, the anon key can read them from the browser.
- [ ] **Delete `lib/supabase/client.ts`** (browser client) — serves no purpose under ADR 010,
      pure footgun.
- [ ] **Audit role-cookie trust.** Cookie is client-controlled → UX hint only. Every privileged
      route must re-derive: session via `auth.api.getSession()`, admin via `ADMIN_EMAILS`,
      mentor/learner via profile-row existence. Audit `/api/mentors/approve|reject|applications`
      first. Write **ADR 011**: "role cookie is advisory; authorization always server-derived."
- [ ] **CX-04: Resend production domain** — SPF/DKIM/DMARC on `lifftlabs.com`, send from
      subdomain (e.g. `mail.`), test deliverability to Gmail, Outlook, and an **nhs.net** address.
- [ ] **CX-07: CI/CD** — GitHub Actions (typecheck/lint/build) + Vercel previews.
      Separate dev/prod Supabase projects. All schema changes via CLI migration files
      from now on — no dashboard hand-edits to prod.

---

## 1 — The consolidated migration (blocks all Phase 3+ feature work)

One migration file covering:

- [ ] Drop legacy FKs to `profiles`; convert to `text`: `mentor_sessions.mentor_id/learner_id`,
      `payments.user_id`, `conversation_participants.user_id`, `messages.sender_id`.
- [ ] Add **real FKs to `"user"(id)`** across app tables. On-delete: `cascade` for profiles,
      `restrict` for `mentor_sessions`/`payments` (GDPR deletion = anonymize, not cascade).
- [ ] Drop `profiles` table. Redistribute: `linkedin_url` → learner_profiles,
      `stripe_customer_id` → learner_profiles. Null/re-point `mentor_applications.reviewed_by`.
- [ ] **Fix exclusion constraint bug**: add `WHERE (status IN ('pending','confirmed'))` —
      currently a cancelled session blocks its slot forever.
- [ ] Add `expired` to `session_status` enum; document `pending` = pending payment.
- [ ] Fold in the new-code migration (delivered file `20260708_calendar_booking.sql`),
      **adjusted**: all `p_mentor_id`/`p_learner_id` params and `mentor_open_slots.mentor_id`
      are **text** not uuid; `hold_slot` inserts `scheduled_at`/`ends_at` (booking_range is
      GENERATED — cannot write it); constraint rides existing `booking_range`.
      Includes: `mentor_open_slots`, `stripe_events`, `lifft_session_id` on blockers,
      `status` on `calendar_integrations`, `google_event_id`/`slot_id`/`expires_at`/
      `stripe_checkout_id` on `mentor_sessions`.
- [ ] Drop & recreate `messages` cleanly (currently has Realtime-internal columns:
      topic/extension/event/payload/private).

---

## 2 — Calendar sync + booking integration (adopt delivered code)

- [ ] `npm i stripe date-fns-tz`. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- [ ] Adopt files, reconciled to real schema: `mentor_profiles` keyed on `user_id` (not `id`);
      price column is `hourly_rate_pence` (not `session_price_pence`).
- [ ] **Truncate `google_calendar_blockers`** (old rows have malformed range strings),
      then `forceFullSync` per mentor.
- [ ] Google Cloud Console: confirm `calendar.events` scope on consent screen
      (verification pass); privacy policy discloses calendar **write** access.
- [ ] Both mentors reconnect (prompt=consent re-grants under new scope).
- [ ] **P3-06 renewal cron** (Edge Function): renew watch channels at `renew_at`,
      AND call `forceFullSync` there (rolling-window fix), AND run `release_expired_holds`
      (or a separate ~10-min schedule for the sweep).
- [ ] Mentor **slot-publishing endpoint + UI** — new work from the explicit-slot model:
      mentor sees week (blockers greyed), publishes concrete slots → `mentor_open_slots`.
      (Not yet written — the main gap in delivered code.)
- [ ] Unit tests for `mapEventToBlocker` (transparency, declined, all-day/BST, cancelled)
      — pure function, DST-week fixtures.

---

## 3 — Payments (Phase 4)

- [ ] P4-01: Stripe Connect **Express** onboarding. Store account id; gate bookability on
      `charges_enabled`/`payouts_enabled` via `account.updated` webhook (handler stub exists).
      Handle Account Link `refresh_url`.
- [ ] Adopt booking route + Stripe webhook (delivered). Keep: 35-min hold / 30-min checkout
      expiry alignment (Stripe's minimum) — do NOT shorten hold without building refund path.
- [ ] **Decide cancellation/refund policy** → terms page before first real payment.
- [ ] EM-06 receipt: decide Stripe's built-in receipt vs own email (not both).
- [ ] P4-04 history/earnings pages. Mentor onboarding docs: note self-employment tax
      responsibility (one line).

---

## 4 — Video (Phase 5)

- [ ] P5-01 token route: three checks (authed, participant of THIS session, within join
      window). Deterministic uid per user (not 0). Token TTL covers session end + buffer.
- [ ] Wire `onTokenPrivilegeWillExpire` renewal (covers early page-load + long sessions).
- [ ] P5-04: **cron-based auto-complete** when `ends_at` passes; client leave = optional
      early trigger only, never the sole signal.
- [ ] P5-02: permission-denied UX (camera blocked screen), device pickers, Safari,
      reconnect path. Test on non-Mac devices.

---

## 5 — Chat (Phase 6) — amended plan

- [ ] **Amend tickets: polling MVP, not Supabase Realtime** (ADR 010 breaks Realtime auth;
      decision: no Sendbird — cost/data-residency/overkill; Stream Maker plan is the
      buy-option if ever needed).
- [ ] Rebuild `conversations`/`conversation_participants`/`messages` (clean, text IDs, FKs).
- [ ] P6-03: create conversation **in the same flow as booking**, unique (learner, mentor),
      `ON CONFLICT DO NOTHING`.
- [ ] Polling: 3–5s `useEffect` on open thread via authed API routes.
- [ ] P6-04: keyset pagination on `(created_at, id)` — never offset.
- [ ] P6-05: debounced digest email (~10–15 min, one email per burst, `last_notified_at`
      per conversation). **No message snippets** in email (NHS privacy posture).
- [ ] Later (post-validation): **ADR 011b — JWT bridge** if push needed: Better Auth JWT
      plugin (JWKS) + Supabase third-party auth; RLS via `auth.jwt()->>'sub' = user_id`
      (text-compatible); requires `role: 'authenticated'` claim. Scoped to chat tables only.

---

## 6 — Security & compliance

- [ ] SC-01 rate limiting: key by user-id-else-IP; tight on auth, looser on messages;
      **exempt** `/api/webhooks/*`; ADD the OAuth kickoff + calendar routes.
- [ ] SC-03: **ICO registration** (~£40–60/yr, legally required); privacy policy incl.
      Google Calendar data handling (must match consent-screen claims); documented
      cross-system deletion process (Supabase + Stripe + Agora).
- [ ] CX-02 PostHog: EU cloud; gate on cookie consent or configure cookieless.
- [ ] CX-01 Sentry: PII scrubbing on, no request bodies from auth/payment routes,
      source maps via Vercel integration.

---

## 7 — Email

- [ ] EM-04 confirmation **with ICS attachment** (covers non-Google calendars — NHS =
      Outlook; complements the Google write-back which sends the learner a real invite
      via `sendUpdates: "all"`).
- [ ] EM-05 24h reminder: idempotent (`reminder_sent_at` check-and-set), times rendered
      in recipient's timezone.

---

## Product decisions logged (no action, don't relitigate)

- Explicit slot-publishing model for MVP (weekly-hours template deferred; becomes a
  slot-suggestion generator later).
- LIFFT is source of truth for sessions; Google is a mirror. Mentor deleting the Google
  event does NOT cancel the session.
- No session recording/transcription in MVP → post-session **Gibbs reflection** flow
  instead (form + one Claude API call). Revisit transcription only on user pull:
  Agora Cloud Recording → Deepgram/AssemblyAI → Claude. Granola: architecturally
  incompatible (read-out API for its own desktop app, not embeddable).
- Overnight availability ranges: explicitly unsupported (validation error).
- Day-of-week convention: pick ISO (1=Mon), document, convert at every boundary.
  ⚠ schema currently says 0=Sunday — whichever you keep, write it down and be consistent.

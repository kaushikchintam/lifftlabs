# LIFFT Labs — Project Tickets

---

## Phase 1 — Foundation ✅ Complete

| ID | Title | Status |
|---|---|---|
| P1-01 | Set up Supabase project and connect CLI | ✅ Done |
| P1-02 | Write and push initial database schema migration | ✅ Done |
| P1-03 | Write and push RLS policies migration | ✅ Done |
| P1-04 | Set up Supabase browser and server clients | ✅ Done |
| P1-05 | Set up Next.js proxy (session refresh + route protection) | ✅ Done |
| P1-06 | Generate TypeScript types from schema | ✅ Done |
| P1-07 | Set up Resend email client | ✅ Done |
| P1-08 | Write architecture docs and ADRs | ✅ Done |

---

## Phase 1.5 — Auth Switch (Better Auth) ✅ Complete

| ID | Title | Status |
|---|---|---|
| P1.5-01 | Install Better Auth and configure Supabase Postgres adapter | ✅ Done |
| P1.5-02 | Strip auth from `lib/supabase/client.ts` and `server.ts` — keep DB only | ✅ Done |
| P1.5-03 | Replace `lib/supabase/proxy.ts` with Better Auth session handler | ✅ Done |
| P1.5-04 | Update root `proxy.ts` to use Better Auth | ✅ Done |
| P1.5-05 | Wire `verification.tsx` into Better Auth `sendVerificationOTP` hook | ✅ Done |
| P1.5-06 | Wire `mentor-approved.tsx` into mentor approval API route via Resend | ✅ Done |
| P1.5-07 | Wire `mentor-rejected.tsx` into mentor rejection API route via Resend | ✅ Done |
| P1.5-08 | Configure Google OAuth provider in Better Auth | ✅ Done |
| P1.5-09 | Configure Apple OAuth provider in Better Auth | ⏭️ Deferred — needs paid Apple account |
| P1.5-10 | Configure Facebook OAuth provider in Better Auth | ⏭️ Deferred — needs live domain |
| P1.5-11 | Remove `@supabase/ssr` package | ✅ Done |
| P1.5-12 | Write ADR for Better Auth decision | ✅ Done |

---

## Phase 2 — Auth UI ✅ Complete

| ID | Title | Status |
|---|---|---|
| P2-00 | Build landing page — hero, value prop, learner/mentor CTA | ✅ Done |
| P2-01 | Build login page — email-first flow + Google | ✅ Done |
| P2-02 | Build role picker modal — "I'm a learner" / "I'm a mentor" | ✅ Done |
| P2-03 | Build learner signup form — name, email, password | ✅ Done |
| P2-04 | Build OTP verification screen — 6-digit code | ✅ Done |
| P2-05 | Build learner onboarding Step 1 — "Where are you now?" | ✅ Done |
| P2-06 | Build learner onboarding Step 2 — "Where do you want to go?" | ✅ Done |
| P2-07 | Build learner onboarding Step 3 — "What's on your mind?" | ✅ Done |
| P2-08 | Wire learner onboarding submit → create `learner_profiles` row → redirect | ✅ Done |
| P2-09 | Build mentor application form — name, email, linkedin | ✅ Done |
| P2-10 | Build mentor application confirmation screen | ✅ Done |
| P2-11 | Build mentor onboarding Step 1 — specialty + one-liner | ✅ Done |
| P2-12 | Build mentor onboarding Step 2 — availability days | ✅ Done |
| P2-13 | Build mentor onboarding Step 3 — hourly rate | ✅ Done |
| P2-14 | Build mentor onboarding Step 4 — set password | ✅ Done |
| P2-15 | Wire mentor onboarding submit → create `mentor_profiles` row → redirect | ✅ Done |
| P2-16 | Build admin mentor application review flow (approve / reject) | ✅ Done |
| P2-17 | Wire approval → send magic link via `mentor-approved.tsx` | ✅ Done |
| P2-18 | Wire rejection → send email via `mentor-rejected.tsx` | ✅ Done |
| P2-19 | Build forgot password flow | ✅ Done |
| P2-20 | Update proxy route protection | ✅ Done |

---

## Phase 3 — Session Booking & Calendar

| ID | Title | Status |
|---|---|---|
| P3-01 | Rebuild dashboard home — upcoming sessions, quick book CTA (both learner + mentor views) | ✅ Done|
| P3-02 | Update sidebar nav — replace pathway items with Sessions, Chat, Calendar | ✅ Done|
| P3-03 | Google Calendar OAuth for mentors — redirect, callback, store tokens in `calendar_integrations` | ✅ Done |
| P3-04 | Sync mentor availability from Google Calendar — fetch instances, cache in `google_calendar_blockers` | 🔲 Todo |
| P3-05 | Set up Google Calendar webhook (Watch channel) — register on connect, store `channel_id` + `renew_at` | 🔲 Todo |
| P3-06 | Build webhook renewal cron (Supabase Edge Function) — renew channels at 50% lifetime using `renew_at` | 🔲 Todo |
| P3-07 | Build mentor availability page — set weekly working hours → `mentor_availability` table | 🔲 Todo |
| P3-07b | Build mentor scheduling settings — buffer time, min notice, session caps → `mentor_profiles` | 🔲 Todo |
| P3-08 | Build session booking UI — learner picks available slot from mentor's calendar | 🔲 Todo |
| P3-09 | API route: create session — validate slot, insert `mentor_sessions`, hold with exclusion constraint | 🔲 Todo |
| P3-10 | Build sessions list page — upcoming + past sessions (both roles) | 🔲 Todo |
| P3-11 | Build session detail page — status, notes, join CTA | 🔲 Todo |
| P3-12 | Send session confirmation email on booking | 🔲 Todo |
| P3-13 | Send 24hr reminder email (Supabase Edge Function) | 🔲 Todo |

---

## Phase 4 — Payments

| ID | Title | Status |
|---|---|---|
| P4-01 | Stripe Connect onboarding for mentor — redirect to Stripe, store `stripe_account_id` | 🔲 Todo |
| P4-02 | Stripe Checkout session for learner — pay for session in GBP | 🔲 Todo |
| P4-03 | Stripe webhook handler — signature verification, mark session payment complete | 🔲 Todo |
| P4-04 | Build payment history page (learner) + earnings page (mentor) | 🔲 Todo |
| P4-05 | Send payment receipt email | 🔲 Todo |

---

## Phase 5 — Video

| ID | Title | Status |
|---|---|---|
| P5-01 | Agora token generation API route — scoped to `sessionId` as channel name | 🔲 Todo |
| P5-02 | Build video call UI — camera, mic controls, leave session | 🔲 Todo |
| P5-03 | Pre-fetch Agora token on session detail page load (not on button click) | 🔲 Todo |
| P5-04 | Mark session complete on call end | 🔲 Todo |

---

## Phase 6 — Chat

| ID | Title | Status |
|---|---|---|
| P6-01 | Build chat UI — message list + input (Supabase Realtime) | 🔲 Todo |
| P6-02 | Wire live messages via Supabase Realtime subscription | 🔲 Todo |
| P6-03 | Create conversation automatically on first session booking | 🔲 Todo |
| P6-04 | Implement cursor-based pagination for chat history | 🔲 Todo |
| P6-05 | New message notification email | 🔲 Todo |

---

## Security

| ID | Title | Status |
|---|---|---|
| SC-01 | Rate limit auth endpoints — `@upstash/ratelimit` on `/api/auth/*`, `/api/sessions`, `/api/chat/messages` | 🔲 Todo |
| SC-02 | Stripe webhook signature verification | 🔲 Todo |
| SC-03 | UK GDPR — privacy policy + cookie notice | 🔲 Todo |

---

## Cross-cutting

| ID | Title | Status |
|---|---|---|
| CX-01 | Set up Sentry error tracking | 🔲 Todo |
| CX-02 | Set up PostHog analytics | 🔲 Todo |
| CX-04 | Configure Resend domain for production (`lifftlabs.com`) | 🔲 Todo |
| CX-06 | Push codebase to GitHub | 🔲 Todo |
| CX-07 | Set up CI/CD pipeline (GitHub Actions + Vercel) | 🔲 Todo |

---

## Email Templates

| ID | Title | Status |
|---|---|---|
| EM-01 | `verification.tsx` — learner OTP verification | ✅ Done |
| EM-02 | `mentor-approved.tsx` — magic link for approved mentors | ✅ Done |
| EM-03 | `mentor-rejected.tsx` — rejection notification | ✅ Done |
| EM-04 | `session-confirmation.tsx` — booking confirmation | 🔲 Todo |
| EM-05 | `session-reminder.tsx` — 24hr session reminder | 🔲 Todo |
| EM-06 | `payment-receipt.tsx` — payment confirmation | 🔲 Todo |

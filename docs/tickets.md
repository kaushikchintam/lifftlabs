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

## Phase 1.5 — Auth Switch (Better Auth)

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
| P1.5-09 | Configure Apple OAuth provider in Better Auth | 🔲 ⏭ Todo | need money to do this
| P1.5-10 | Configure Facebook OAuth provider in Better Auth | 🔲 ⏭ Todo | need live domain for this
| P1.5-11 | Remove `@supabase/ssr` package | ✅ Done  |
| P1.5-12 | Write ADR for Better Auth decision | ✅ Done  |

---

## Phase 2 — Auth UI

| ID | Title | Status |
|---|---|---|
| P2-00 | Build landing page — hero, value prop, learner/mentor CTA |  ✅ Done |
| P2-01 | Build login page — email-first flow (step 1: email, step 2: password) + Google only | ✅ Done |
| P2-02 | Build role picker modal — "I'm a learner" / "I'm a mentor" (triggered from landing page CTA) | ✅ Done |
| P2-03 | Build learner signup form — name, email, password | ✅ Done |
| P2-04 | Build OTP verification screen — enter 6-digit code (learner signup only, not on login) | 🔲 Todo |
| P2-05 | Build learner onboarding Step 1 — "Where are you now?" (background) | 🔲 Todo |
| P2-06 | Build learner onboarding Step 2 — "Where do you want to go?" (target role) | 🔲 Todo |
| P2-07 | Build learner onboarding Step 3 — "What's on your mind?" (primary concern) | 🔲 Todo |
| P2-08 | Wire learner onboarding submit → create `learner_profiles` row → redirect to dashboard | 🔲 Todo |
| P2-09 | Build mentor application form — name, email, linkedin | 🔲 Todo |
| P2-10 | Build mentor application confirmation screen — "We'll be in touch" | 🔲 Todo |
| P2-11 | Build mentor onboarding Step 1 — "What leap did you make?" (specialty + one-liner) | 🔲 Todo |
| P2-12 | Build mentor onboarding Step 2 — "When can you coach?" (availability days) | 🔲 Todo |
| P2-13 | Build mentor onboarding Step 3 — "Set your hourly rate" (slider) | 🔲 Todo |
| P2-14 | Wire mentor onboarding submit → create `mentor_profiles` row → redirect to dashboard | 🔲 Todo |
| P2-15 | Build admin mentor application review flow (approve / reject) | 🔲 Todo |
| P2-16 | Wire approval → send magic link via `mentor-approved.tsx` | 🔲 Todo |
| P2-17 | Wire rejection → send email via `mentor-rejected.tsx` | 🔲 Todo |
| P2-18 | Build forgot password flow | 🔲 Todo |
| P2-19 | Update proxy route protection — redirect unauthenticated users, redirect incomplete onboarding | 🔲 Todo |

---

## Phase 3 — Core Learner UI

| ID | Title | Status |
|---|---|---|
| P3-01 | Build learner dashboard home — progress summary, upcoming sessions, continue pathway | 🔲 Todo |
| P3-02 | Build pathway browser — list published pathways with filters | 🔲 Todo |
| P3-03 | Build pathway detail page — milestones, modules, enroll CTA | 🔲 Todo |
| P3-04 | Wire pathway enroll → create `user_pathway_progress` row | 🔲 Todo |
| P3-05 | Build milestone detail — mark complete, upload evidence | 🔲 Todo |
| P3-06 | Wire milestone complete → create `milestone_completions` row, update progress | 🔲 Todo |
| P3-07 | Build microlearning module viewer — video, article, quiz, exercise | 🔲 Todo |
| P3-08 | Build portfolio page — list completed milestones and evidence | 🔲 Todo |
| P3-09 | Build mentor match page — "See my matches" based on learner profile | 🔲 Todo |

---

## Phase 4 — Mentor UI

| ID | Title | Status |
|---|---|---|
| P4-01 | Build public mentor profile page | 🔲 Todo |
| P4-02 | Build mentor dashboard home — upcoming sessions, cohorts, earnings summary | 🔲 Todo |
| P4-03 | Build pathway creation flow — title, description, milestones, modules | 🔲 Todo |
| P4-04 | Build program creation flow — wrap pathway with price, cohort size | 🔲 Todo |
| P4-05 | Build cohort management page — enrolled learners, progress overview | 🔲 Todo |
| P4-06 | Build mentor availability management — update available days and rate | 🔲 Todo |
| P4-07 | Wire Stripe Connect onboarding — redirect mentor to Stripe, store `stripe_account_id` | 🔲 Todo |

---

## Phase 5 — Interactions

| ID | Title | Status |
|---|---|---|
| P5-01 | Build conversations list page | 🔲 Todo |
| P5-02 | Build conversation detail page — real-time messages via Supabase Realtime | 🔲 Todo |
| P5-03 | Wire new conversation creation via service role API route | 🔲 Todo |
| P5-04 | Build session booking flow — learner books a session with a mentor | 🔲 Todo |
| P5-05 | Build session detail page — status, notes, join video call CTA | 🔲 Todo |
| P5-06 | Build Agora token generation API route | 🔲 Todo |
| P5-07 | Build video session UI — camera, mic controls, leave session | 🔲 Todo |
| P5-08 | Build Stripe payment flow — learner pays for session or program | 🔲 Todo |
| P5-09 | Build Stripe webhook handler — update `payments` table on success/failure | 🔲 Todo |
| P5-10 | Build payment receipt page | 🔲 Todo |
| P5-11 | Send session confirmation email via Resend on booking | 🔲 Todo |
| P5-12 | Send session reminder email 24hrs before via Supabase Edge Function | 🔲 Todo |

---

## Cross-cutting

| ID | Title | Status |
|---|---|---|
| CX-01 | Set up Sentry error tracking — frontend and API routes | 🔲 Todo |
| CX-02 | Set up PostHog product analytics | 🔲 Todo |
| CX-03 | Build mentor-learner AI matching algorithm (Go service + Claude API) | 🔲 Todo |
| CX-04 | Configure Resend domain for production (`lifftlabs.com`) | 🔲 Todo |
| CX-05 | Set up Cloudflare Stream or Mux for video module hosting | 🔲 Todo |
| CX-06 | Push codebase to GitHub | 🔲 Todo |
| CX-07 | Set up CI/CD pipeline (GitHub Actions + Vercel) | 🔲 Todo |

---

## Email Templates

| ID | Title | Status |
|---|---|---|
| EM-01 | `verification.tsx` — learner OTP verification | ✅ Done |
| EM-02 | `mentor-approved.tsx` — magic link for approved mentors | ✅ Done |
| EM-03 | `mentor-rejected.tsx` — rejection notification | ✅ Done |
| EM-04 | `session-confirmation.tsx` — session booking confirmation | 🔲 Todo |
| EM-05 | `session-reminder.tsx` — 24hr session reminder | 🔲 Todo |
| EM-06 | `payment-receipt.tsx` — payment confirmation | 🔲 Todo |

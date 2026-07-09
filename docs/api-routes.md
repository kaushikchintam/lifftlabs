# LIFT — API Routes, Sessions, and Client/Server Dynamics

> Note: `docs/architecture.md` is outdated — it still references Supabase Auth. Better Auth replaced it in Phase 1.5. This document reflects the current architecture.

---

## How Sessions Work

Better Auth owns all identity and session state. Sessions are stored in Better Auth's own `session` table and passed via HTTP-only cookies automatically.

### Session lifecycle — Learner

1. Signup with email + password → OTP verification → session created
2. Or Google OAuth → session created
3. Proxy checks: does `learner_profiles` row exist for this user?
   - No → redirect to `/onboarding/learner`
   - Yes → allow through to `/dashboard`
4. Future logins: email + password or Google → session

### Session lifecycle — Mentor

1. Apply via `/signup/mentor` → row inserted into `mentor_applications` (no account yet)
2. Admin approves → `/api/mentors/approve` calls `auth.api.signInMagicLink` → Better Auth creates user, sends magic link email
3. Mentor clicks magic link → Better Auth creates session → redirect to `/onboarding/mentor`
4. Step 4 of onboarding: mentor sets password → `/api/onboarding/mentor` calls `auth.api.setPassword` server-side (Better Auth verifies no existing password before setting)
5. After onboarding: `mentor_profiles` row exists → access to mentor dashboard
6. Future logins: email + password → session

### Role determination

Better Auth's session contains `user.id`, `user.email`, `user.name` — no role field. Role is inferred at the server layer by checking which extension table row exists:

- `mentor_profiles` row exists → mentor
- `learner_profiles` row exists → learner
- Neither → onboarding incomplete, redirect accordingly
- Admin: determined by a `role` field check on `profiles`

The proxy (P2-20) is responsible for making these checks on every protected route.

---

## Client vs Server Dynamics

**The rule (ADR 008): API routes are the trust boundary. All DB writes and sensitive reads go through server-side API routes.**

| Concern | Client side | Server side |
|---|---|---|
| Auth state | `authClient.useSession()` — React hook, reads from cookie | `auth.api.getSession({ headers: req.headers })` |
| Auth actions | `authClient.signIn.*`, `authClient.signOut()` | `auth.api.*` (server-only methods like `setPassword`) |
| DB reads | `fetch("/api/...")` | `supabaseAdmin.from(...)` — service role |
| DB writes | `fetch("/api/...")` | `supabaseAdmin.from(...)` — service role |
| Service role key | Never — env var is server-only | Always |
| RLS | Not applicable (service role bypasses) | Not applicable (same reason) |

### Why all reads go through API routes (not Supabase browser client)

RLS policies exist but are non-functional with Better Auth (see ADR 008). The Supabase anon key would expose unprotected data. Until RLS is re-implemented with Better Auth JWTs (deferred to pre-production), all data access goes through API routes that verify the Better Auth session first.

### Stripe webhook — the one exception

`POST /api/webhooks/stripe` is called by Stripe's servers, not by your users. **Never check the Better Auth session here.** Instead, verify the Stripe signature using `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)`. Use `supabaseAdmin` for all DB writes. This is the only route where session verification is intentionally absent.

---

## Phase 3 — Core Learner

### Routes

| Method | Path | What it does | Auth |
|---|---|---|---|
| GET | `/api/pathways` | List published pathways | Learner session |
| GET | `/api/pathways/[id]` | Pathway detail with milestones | Learner session |
| POST | `/api/pathways/[id]/enroll` | Create `user_pathway_progress` row | Learner session |
| GET | `/api/pathways/[id]/progress` | Learner's progress on a pathway | Learner session |
| POST | `/api/milestones/[id]/complete` | Create `milestone_completions` row, sync `current_milestone_id` on progress | Learner session |
| GET | `/api/modules/[id]` | Module content (video URL, article, quiz data) | Learner session |
| POST | `/api/portfolio` | Upload portfolio evidence linked to a milestone completion | Learner session |
| GET | `/api/portfolio` | List current learner's portfolio items | Learner session |
| GET | `/api/mentors/matches` | Return mentor matches based on learner profile (specialty, target role) | Learner session |

### Foreseeable additions

- `GET /api/pathways/recommended` — personalised pathway recommendations based on `learner_profiles.target_role`
- `GET /api/pathways/[id]/certificate` — generate a completion certificate once all milestones are done
- `DELETE /api/pathways/[id]/enroll` — unenroll from a pathway (with rules: can't unenroll from an active cohort)
- `POST /api/modules/[id]/complete` — mark individual modules complete, not just milestones
- `GET /api/learners/[id]/progress` — mentor viewing a specific learner's progress across pathways

### Subscription gate (when added)

Before any enroll or content access, the route checks if the learner has an active subscription. Subscription status lives in a `subscriptions` table (separate from `payments`) — query it in the session middleware or per-route. Do not put this on `learner_profiles`.

---

## Phase 4 — Mentor

### Routes

| Method | Path | What it does | Auth |
|---|---|---|---|
| POST | `/api/pathways` | Create a new pathway | Mentor session |
| PUT | `/api/pathways/[id]` | Update pathway metadata | Mentor session + ownership check |
| DELETE | `/api/pathways/[id]` | Archive a pathway | Mentor session + ownership check |
| POST | `/api/pathways/[id]/milestones` | Add a milestone to a pathway | Mentor session + ownership |
| PUT | `/api/milestones/[id]` | Update milestone | Mentor session + ownership |
| POST | `/api/milestones/[id]/modules` | Add a microlearning module | Mentor session + ownership |
| PUT | `/api/modules/[id]` | Update module content | Mentor session + ownership |
| POST | `/api/programs` | Create a program (wrap pathway with price + schedule) | Mentor session |
| GET | `/api/programs/[id]/cohorts` | List cohorts for a program | Mentor session |
| POST | `/api/programs/[id]/cohorts` | Create a new cohort intake | Mentor session |
| GET | `/api/cohorts/[id]/members` | List enrolled learners in a cohort | Mentor session |
| PUT | `/api/mentors/profile` | Update mentor availability, rate, bio | Mentor session |
| POST | `/api/stripe/connect/onboard` | Initiate Stripe Connect OAuth — returns redirect URL to Stripe | Mentor session |
| GET | `/api/stripe/connect/callback` | Handle Stripe OAuth callback, store `stripe_account_id` on mentor profile | Mentor session |
| GET | `/api/stripe/connect/account` | Get Stripe Connect account status (charges enabled, payouts enabled) | Mentor session |

### Foreseeable additions

- `POST /api/pathways/[id]/publish` — submit pathway for visibility (admin review or auto-publish)
- `POST /api/pathways/[id]/duplicate` — clone a pathway as a starting point for a new one
- `POST /api/cohorts/[id]/close` — close enrollment, move cohort from `forming` to `active`
- `GET /api/cohorts/[id]/progress` — aggregate progress view across all cohort members
- `GET /api/mentors/earnings` — earnings summary from `payments` table, filtered by `mentor_id`
- `GET /api/stripe/connect/dashboard-link` — generate a Stripe Express dashboard link for the mentor

### Ownership checks

Every pathway/milestone/module/program write must verify that the resource belongs to the requesting mentor. Don't rely on the client passing the right `mentor_id` — always resolve it from the session.

---

## Phase 5 — Interactions

### Routes

| Method | Path | What it does | Auth |
|---|---|---|---|
| GET | `/api/conversations` | List conversations for current user | Any session |
| POST | `/api/conversations` | Create a new conversation | Any session (service role DB write — circular RLS) |
| GET | `/api/conversations/[id]/messages` | Paginated messages | Session + participant check |
| POST | `/api/conversations/[id]/messages` | Send a message | Session + participant check |
| PUT | `/api/conversations/[id]/read` | Mark messages as read (updates `read_at`) | Session + participant check |
| POST | `/api/sessions/book` | Learner books a session with a mentor, creates `mentor_sessions` row | Learner session |
| GET | `/api/sessions/[id]` | Session detail (status, participants, notes) | Session + participant check |
| PUT | `/api/sessions/[id]/status` | Update session status: confirm, cancel, complete | Mentor session (confirm/complete), either (cancel) |
| POST | `/api/agora/token` | Generate short-lived Agora RTC token for a session's channel | Session + participant check |
| POST | `/api/payments/checkout` | Create Stripe PaymentIntent or Checkout Session for a session or program | Learner session |
| POST | `/api/webhooks/stripe` | Handle Stripe webhook events — update `payments` table | **No session — Stripe signature instead** |
| GET | `/api/payments/[id]/receipt` | Receipt data for a completed payment | Session + ownership |

### Foreseeable additions

- `GET /api/sessions/upcoming` — upcoming sessions for current user (used on both dashboards)
- `POST /api/sessions/[id]/cancel` — cancel with refund logic: call Stripe refund, update `payments.status`, update session status
- `POST /api/payments/refund` — admin-initiated or policy-based refund
- `GET /api/payments/history` — full payment history for a learner or mentor
- `POST /api/conversations/[id]/messages/[msgId]/read` — per-message read receipts (requires replacing `messages.read_at` with a `message_reads` junction table — see schema.md note)
- `GET /api/agora/channel/[sessionId]/active` — check if a video channel is currently live before joining

### Critical notes for Phase 5

**`POST /api/conversations` — service role required**
`conversations` has circular RLS: you can't INSERT a row without an existing row to check permissions against. This is documented in ADR 008. The API route must use `supabaseAdmin` for the insert, then add the creator as a participant in the same transaction.

**Agora tokens — never on the client**
Agora tokens are generated server-side using the Agora App Certificate (secret). Tokens are short-lived (~1 hour) and bound to a specific channel name (use the session ID as the channel). Never expose the App Certificate in client code.

**Stripe webhook — raw body required**
Next.js parses request bodies by default. The Stripe webhook handler must read the raw body to verify the signature. In Next.js App Router, disable body parsing for this route by reading `request.body` as a stream, or use `request.text()` before `stripe.webhooks.constructEvent`.

---

## Route Protection Summary (P2-20)

The proxy checks on every request:

| Route group | Check | Redirect if failing |
|---|---|---|
| `/(dashboard)/*` | Valid Better Auth session | `/login` |
| `/(dashboard)/admin/*` | Session + `profiles.role === admin` | `/dashboard` |
| `/(auth)/onboarding/learner` | Session + no `learner_profiles` row | `/dashboard` if already onboarded |
| `/(auth)/onboarding/mentor` | Session + no `mentor_profiles` row | `/dashboard` if already onboarded |
| `/(marketing)/*` | None | — |
| `/(auth)/login`, `/signup/*` | No active session | `/dashboard` if already logged in |

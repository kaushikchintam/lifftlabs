# LIFFT Labs — Codebase Architecture

LIFFT Labs is a healthcare mentoring MVP that connects learners (people retraining into healthcare) with mentors (experienced professionals). Mentors publish availability slots, learners book and pay for sessions, and both sides meet via video call.

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.6 |
| Language | TypeScript | ^5 |
| Database | Supabase (Postgres) | @supabase/supabase-js ^2.107 |
| Auth | Better Auth | ^1.6.20 |
| Styling | Tailwind CSS v4 | ^4 |
| Payments | Stripe + Connect | ^22.3 |
| Email | Resend + React Email | ^6.14 |
| Calendar | Google Calendar API | googleapis ^173 |
| Video | Agora (Phase 5 — not yet wired) | agora-rtc-sdk-ng ^4.24.6 |
| Error tracking | Sentry | @sentry/nextjs ^10.66 |
| Rate limiting | Upstash Redis + Ratelimit | ^2.0.8 / ^1.38 |

---

## Directory Structure

```
LIFT/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth + onboarding pages (no dashboard shell)
│   │   ├── layout.tsx            # Passthrough layout
│   │   ├── login/page.tsx        # Email + password login, Google OAuth
│   │   ├── forgot-password/      # Request password reset
│   │   ├── reset-password/       # Consume reset token
│   │   ├── signup/
│   │   │   ├── page.tsx          # Role picker (learner vs mentor)
│   │   │   ├── learner/page.tsx  # Learner signup (email + OTP verification)
│   │   │   └── mentor/
│   │   │       ├── page.tsx      # Mentor application form
│   │   │       └── applied/      # Post-application confirmation page
│   │   └── onboarding/
│   │       ├── learner/page.tsx  # Learner onboarding (position, target role, concern)
│   │       └── mentor/page.tsx   # Mentor onboarding (specialty, rate, availability, password)
│   │
│   ├── (dashboard)/              # Authenticated app shell (sidebar layout)
│   │   ├── layout.tsx            # DashboardLayout — Sidebar + main content
│   │   ├── dashboard/page.tsx    # Home — mock learner stats (mock data)
│   │   ├── sessions/
│   │   │   ├── page.tsx          # Session list (upcoming + past, both roles)
│   │   │   └── [id]/page.tsx     # Session detail + payment status poller
│   │   ├── calendar/page.tsx     # Mentor calendar — BlockerWeek + SlotPublisher
│   │   ├── book/[mentorId]/      # Learner slot picker for a specific mentor
│   │   ├── earnings/page.tsx     # Mentor earnings (paid sessions, net after 15% fee)
│   │   ├── payments/page.tsx     # Learner payment history
│   │   ├── coaches/              # Legacy — stub pages (browse all / profile)
│   │   ├── appointments/         # Legacy — stub pages
│   │   ├── messages/             # Legacy — stub pages
│   │   └── admin/
│   │       └── mentors/page.tsx  # Admin: review + approve/reject applications
│   │
│   ├── (marketing)/              # Public pages (nav + footer shell)
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page with role picker modal
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...all]/route.ts          # Better Auth catch-all handler
│       │   ├── google-calendar/route.ts   # Initiate Google Calendar OAuth
│       │   ├── google-calendar/callback/  # OAuth callback → registerWatchChannel
│       │   ├── login/route.ts             # Legacy (unused — Better Auth handles login)
│       │   ├── logout/route.ts            # Legacy
│       │   └── signup/route.ts            # Legacy
│       │
│       ├── mentor/
│       │   ├── slots/route.ts             # GET own slots / POST publish slot
│       │   ├── slots/[id]/route.ts        # DELETE withdraw slot
│       │   ├── blockers/route.ts          # GET own calendar blockers (7 days)
│       │   ├── calendar/sync/route.ts     # Manual calendar sync trigger
│       │   ├── stripe/onboard/route.ts    # POST create/resume Stripe Connect onboarding
│       │   └── stripe/refresh/route.ts    # GET refresh expired Account Link
│       │
│       ├── mentors/
│       │   ├── apply/route.ts             # POST submit mentor application (public)
│       │   ├── applications/route.ts      # GET pending applications (admin only)
│       │   ├── approve/route.ts           # POST approve application → magic link email
│       │   ├── reject/route.ts            # POST reject application → rejection email
│       │   └── [id]/slots/route.ts        # GET mentor's open slots (learner view)
│       │
│       ├── onboarding/
│       │   ├── mentor/route.ts            # POST complete mentor profile + set password
│       │   └── learner/route.ts           # POST complete learner profile
│       │
│       ├── sessions/route.ts              # POST hold slot + create Stripe Checkout
│       ├── signout/route.ts               # POST sign out
│       ├── users/me/route.ts              # GET/PATCH current user profile
│       ├── users/me/avatar/route.ts       # Avatar upload
│       │
│       ├── webhooks/
│       │   ├── stripe/route.ts            # Stripe webhook (checkout, account.updated)
│       │   └── google-calendar/route.ts   # Google push notification handler
│       │
│       └── cron/
│           ├── calendar-maintenance/route.ts  # Renew watch channels + full sync
│           └── session-reminders/route.ts     # 24h session reminder emails
│
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── schema.ts             # Zod schemas for login / signup forms
│   │   ├── actions.ts            # Server actions (legacy)
│   │   └── components/
│   │       ├── login-form.tsx    # (legacy — login page is self-contained)
│   │       └── signup-form.tsx   # (legacy)
│   ├── booking/
│   │   └── components/
│   │       └── slot-picker.tsx   # Learner slot picker — fetches slots, books via POST /api/sessions
│   ├── calendar/
│   │   └── components/
│   │       ├── blocker-week.tsx  # Shows mentor's busy time for next 7 days
│   │       └── slot-publisher.tsx # Mentor publishes / withdraws open slots
│   ├── payments/
│   │   └── components/
│   │       ├── payout-banner.tsx       # Server component — Stripe onboarding CTA for mentors
│   │       └── setup-payouts-button.tsx # Client button → POST /api/mentor/stripe/onboard
│   ├── sessions/
│   │   └── components/
│   │       └── payment-status.tsx  # PaymentStatusRefresher — polls after ?payment=success
│   ├── appointments/             # Legacy — pre-refactor stubs
│   ├── coaches/                  # Legacy — pre-refactor stubs
│   └── clients/                  # Legacy — pre-refactor stubs
│
├── lib/
│   ├── auth/
│   │   ├── index.ts              # Better Auth config (emailOTP, magicLink, Google OAuth)
│   │   ├── client.ts             # Better Auth browser client (authClient)
│   │   └── require-admin.ts      # requireAdmin / requireSession helpers
│   ├── calendar/
│   │   ├── client.ts             # Per-mentor OAuth2 client factory, token refresh
│   │   ├── sync.ts               # syncMentorCalendar, forceFullSync (incremental + full)
│   │   ├── watch.ts              # registerWatchChannel — Google push notification setup
│   │   ├── writeback.ts          # createSessionCalendarEvent / deleteSessionCalendarEvent
│   │   └── ics.ts                # buildSessionIcs — iCalendar attachment builder
│   ├── emails/
│   │   └── session-confirmation.ts  # sendSessionConfirmation — sends ICS to both participants
│   ├── resend/
│   │   └── client.ts             # Resend singleton (RESEND_API_KEY)
│   ├── supabase/
│   │   ├── admin.ts              # supabaseAdmin — service-role client (server only)
│   │   └── server.ts             # supabaseServer — anon client for server components
│   ├── agora/
│   │   └── client.ts             # Stub — Phase 5
│   └── utils.ts                  # cn() Tailwind class merger
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # Collapsible sidebar nav (client component)
│   │   ├── nav.tsx               # Marketing top nav
│   │   └── footer.tsx            # Marketing footer
│   ├── marketing/
│   │   └── role-picker.tsx       # Modal to choose learner vs mentor (landing page)
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── modal.tsx
│
├── emails/                       # React Email templates
│   ├── verification.tsx          # OTP verification code (signup)
│   ├── mentor-approved.tsx       # Approval + magic link (EM-03)
│   ├── mentor-rejected.tsx       # Rejection notice
│   ├── session-confirmation.tsx  # Session confirmed + ICS attachment (EM-04)
│   ├── session-reminder.tsx      # 24h reminder (EM-05)
│   └── password-reset.tsx        # Password reset link
│
├── supabase/
│   └── migrations/               # Ordered SQL migrations (applied via Supabase CLI)
│
├── types/
│   ├── database.types.ts         # Auto-generated Supabase types (run: supabase gen types typescript)
│   ├── appointment.ts            # Legacy
│   ├── client.ts                 # Legacy
│   ├── coach.ts                  # Legacy
│   └── conversation.ts           # Legacy
│
├── hooks/                        # Legacy client hooks (pre-refactor)
│   ├── use-appointments.ts
│   ├── use-messages.ts
│   └── use-user.ts
│
├── utils/
│   └── format-date.ts            # Date formatting helpers
│
├── docs/                         # Project documentation
│   ├── architecture.md           # This file
│   ├── tickets.md                # Feature tickets by phase
│   ├── db-schema.md
│   ├── schema.md
│   ├── api-routes.md
│   ├── engineering-notes.md
│   ├── testing-runbook.md
│   ├── todos.md
│   └── adr/                      # Architecture Decision Records (001–010)
│
├── proxy.ts                      # Next.js middleware (auth guards, role routing)
├── vercel.json                   # Cron job schedules
├── next.config.ts
└── tsconfig.json
```

---

## Route Map

### Public Routes (`(marketing)/`)
| URL | File | Description |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Landing page, role picker modal |

### Auth Routes (`(auth)/`)
| URL | File | Auth Required |
|---|---|---|
| `/login` | `login/page.tsx` | No |
| `/signup` | `signup/page.tsx` | No — role picker |
| `/signup/learner` | `signup/learner/page.tsx` | No — email + OTP |
| `/signup/mentor` | `signup/mentor/page.tsx` | No — application form |
| `/signup/mentor/applied` | `signup/mentor/applied/page.tsx` | No — confirmation |
| `/forgot-password` | `forgot-password/page.tsx` | No |
| `/reset-password` | `reset-password/page.tsx` | No |
| `/onboarding/learner` | `onboarding/learner/page.tsx` | Yes (session, no role) |
| `/onboarding/mentor` | `onboarding/mentor/page.tsx` | Yes (session, no role) |

### Dashboard Routes (`(dashboard)/`)
| URL | File | Role |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | Any |
| `/dashboard/sessions` | `sessions/page.tsx` | Any |
| `/dashboard/sessions/[id]` | `sessions/[id]/page.tsx` | Participant only |
| `/dashboard/calendar` | `calendar/page.tsx` | Mentor |
| `/dashboard/book/[mentorId]` | `book/[mentorId]/page.tsx` | Learner |
| `/dashboard/earnings` | `earnings/page.tsx` | Mentor |
| `/dashboard/payments` | `payments/page.tsx` | Learner |
| `/dashboard/admin/mentors` | `admin/mentors/page.tsx` | Admin (ADMIN_EMAILS) |

---

## Middleware (proxy.ts)

Runs on every request (Next.js middleware, loaded from `proxy.ts`).

**Rules in order:**
1. Session exists + `emailVerified = false` → redirect to `/signup/learner`
2. No session + role cookie → clear stale role cookie
3. Session + email in `ADMIN_EMAILS` → set `role=admin` cookie
4. No session + protected path (`/dashboard`, `/onboarding`, `/admin`) → `/login`
5. Session + auth page (`/login`, `/signup/*`) → `/dashboard`
6. Session + no role cookie + `/onboarding/*` → allow through
7. Session + no role cookie + has `mentor_profiles` row → set `role=mentor`, redirect `/dashboard`
8. Session + no role cookie + has `learner_profiles` row → set `role=learner`, redirect `/dashboard`
9. Session + no role + hitting `/dashboard` → check if magic-link account → `/onboarding/mentor` or `/onboarding/learner`
10. Session + non-admin hitting `/admin/*` → `/dashboard`

---

## API Routes

### Auth
| Method | Path | Description |
|---|---|---|
| `*` | `/api/auth/[...all]` | Better Auth catch-all |
| `GET` | `/api/auth/google-calendar` | Start Google Calendar OAuth |
| `GET` | `/api/auth/google-calendar/callback` | OAuth callback → store tokens + register watch channel |

### Mentor Management
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/mentors/apply` | None | Submit mentor application |
| `GET` | `/api/mentors/applications` | Admin | List pending applications |
| `POST` | `/api/mentors/approve` | Admin | Approve → send magic link email |
| `POST` | `/api/mentors/reject` | Admin | Reject → send rejection email |
| `GET` | `/api/mentors/[id]/slots` | Session | Learner view of a mentor's open slots |

### Onboarding
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/onboarding/mentor` | Session | Save mentor profile + set password + set role cookie |
| `POST` | `/api/onboarding/learner` | Session | Save learner profile + set role cookie |

### Mentor Tools
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET/POST` | `/api/mentor/slots` | Mentor session | List own slots / publish new slot |
| `DELETE` | `/api/mentor/slots/[id]` | Mentor session | Withdraw open slot |
| `GET` | `/api/mentor/blockers` | Mentor session | Own calendar blockers next 7 days |
| `GET` | `/api/mentor/calendar/sync` | Mentor session | Manual calendar sync |
| `POST` | `/api/mentor/stripe/onboard` | Mentor session | Create/resume Stripe Connect Express account |
| `GET` | `/api/mentor/stripe/refresh` | Mentor session | Refresh expired Account Link |

### Booking & Sessions
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions` | Session | Hold slot + create Stripe Checkout |

### Webhooks
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhooks/stripe` | Stripe signature-verified events |
| `POST` | `/api/webhooks/google-calendar` | Google push notification pings |

### Cron (CRON_SECRET header required)
| Method | Path | Schedule | Description |
|---|---|---|---|
| `GET` | `/api/cron/calendar-maintenance` | 3am UTC daily | Renew expiring watch channels + forceFullSync |
| `GET` | `/api/cron/session-reminders` | 8am UTC daily | Send 24h reminder emails |

---

## Database Schema

### Core Tables (Better Auth managed)
| Table | Description |
|---|---|
| `user` | All users (id as text UUID) |
| `session` | Better Auth sessions |
| `account` | OAuth + credential accounts per user |
| `verification` | OTP + magic link tokens |

### Profile Tables
| Table | Key Columns |
|---|---|
| `learner_profiles` | user_id (text FK), current_position, target_role, primary_concern |
| `mentor_profiles` | user_id (text FK), specialty[], one_liner, available_days[], hourly_rate_pence, stripe_account_id, charges_enabled, min_notice_hours, buffer_minutes |
| `mentor_applications` | full_name, email (unique), linkedin_url, status (pending/approved/rejected) |

### Calendar Tables
| Table | Key Columns |
|---|---|
| `calendar_integrations` | mentor_id, access_token, refresh_token, channel_id, resource_id, channel_expiry, renew_at, status |
| `google_calendar_blockers` | mentor_id, event_id, blocker_range (tstzrange), lifft_session_id |

### Booking Tables
| Table | Key Columns |
|---|---|
| `mentor_open_slots` | mentor_id, slot_range (tstzrange), status (open/held/booked/withdrawn), exclusion constraint |
| `mentor_sessions` | mentor_id, learner_id, booking_range (tstzrange), status (pending/confirmed/cancelled/expired), slot_id, stripe_checkout_id, google_event_id, expires_at, reminder_sent_at |
| `payments` | user_id, session_id, amount_pence, currency, status, stripe_payment_intent_id (unique) |
| `stripe_events` | id (Stripe event id, unique), type — idempotency ledger |

### Messaging Tables
| Table | Key Columns |
|---|---|
| `conversations` | id |
| `conversation_participants` | conversation_id, user_id |
| `messages` | conversation_id, sender_id, content, created_at |

### RPCs (Postgres Functions)
| Function | Description |
|---|---|
| `hold_slot(p_slot_id, p_learner_id, p_hold_minutes)` | Atomic slot hold + pending session creation |
| `confirm_session(p_session_id)` | Mark session confirmed, slot booked |
| `release_session(p_session_id)` | Release hold, restore slot to open |
| `release_expired_holds()` | Sweeps expired holds (called by pg_cron) |
| `replace_mentor_blockers(mentor_id, events)` | Full sync — replaces all blockers |
| `apply_blocker_delta(mentor_id, added, removed)` | Incremental sync |
| `reconcile_open_slots(mentor_id)` | Re-checks open slots against new blockers |

### Cron Jobs (pg_cron)
| Schedule | Function |
|---|---|
| Every 10 minutes | `release_expired_holds()` |

---

## Migrations (in order)

| File | Description |
|---|---|
| `20260611153703_initial_schema.sql` | Initial schema |
| `20260618082740_rls_policies.sql` | RLS policies (later dropped) |
| `20260618125549_drop_auto_create_profile_trigger.sql` | Remove auto-profile trigger |
| `20260618142954_add_primary_concern_to_learner_profiles.sql` | Add primary_concern column |
| `20260618144820_mentor_application_and_profile_updates.sql` | Mentor application table |
| `20260619083555_add_stripe_fields.sql` | Stripe fields on mentor_profiles |
| `20260624000000_learner_profiles_text_user_id.sql` | Fix user_id to text |
| `20260625000000_mentor_profiles_text_user_id.sql` | Fix user_id to text |
| `20260629000000_drop_auth_uid_policies.sql` | Drop auth.uid() RLS (using API routes instead) |
| `20260706000000_drop_unused_add_calendar_schema.sql` | Add calendar_integrations + blockers tables |
| `20260706000001_mentor_scheduling_settings.sql` | min_notice_hours, buffer_minutes on mentor_profiles |
| `20260709000000_schema_cleanup_and_booking.sql` | Full booking schema — slots, sessions, payments, stripe_events, RPCs |
| `20260713000000_hold_sweep_cron.sql` | pg_cron: release_expired_holds every 10 min |
| `20260714000000_reminder_sent_at.sql` | reminder_sent_at column on mentor_sessions |
| `20260714000001_charges_enabled.sql` | charges_enabled column on mentor_profiles |

---

## Auth Flow

```
Learner signup:
  /signup/learner → OTP email (emailOTP plugin) → verify → /onboarding/learner
  → POST /api/onboarding/learner → insert learner_profiles → role=learner cookie → /dashboard

Mentor flow:
  /signup/mentor → POST /api/mentors/apply → mentor_applications insert
  Admin approves → POST /api/mentors/approve → signInMagicLink → MentorApprovalEmail sent
  Mentor clicks magic link → /api/auth/magic-link/verify → /onboarding/mentor
  → POST /api/onboarding/mentor → insert mentor_profiles + setPassword → role=mentor cookie → /dashboard
```

---

## Booking Flow

```
Learner visits /dashboard/book/[mentorId]
→ SlotPicker fetches GET /api/mentors/[id]/slots
→ Learner selects slot, clicks Book
→ POST /api/sessions:
    1. Check slot.status = open + mentor.charges_enabled
    2. hold_slot RPC → creates pending mentor_session (35 min hold)
    3. Stripe Checkout created (destination charge to mentor's Express account)
    4. Browser → Stripe Checkout page

On payment success:
→ Stripe webhook → checkout.session.completed
→ confirm_session RPC → session status = confirmed, slot status = booked
→ createSessionCalendarEvent (Google Calendar writeback, best-effort)
→ sendSessionConfirmation (Resend email with ICS to both parties, best-effort)
→ PaymentStatusRefresher polls router.refresh() on /sessions/[id]?payment=success

On payment expiry:
→ checkout.session.expired → release_session RPC → slot back to open

On hold expiry (no checkout):
→ pg_cron every 10 min → release_expired_holds()
```

---

## Email Templates

| Template | Trigger | Recipients |
|---|---|---|
| `verification.tsx` | Learner signup OTP | Learner |
| `mentor-approved.tsx` | Admin approves application | Mentor (magic link) |
| `mentor-rejected.tsx` | Admin rejects application | Mentor |
| `session-confirmation.tsx` | Payment confirmed | Mentor + Learner (+ .ics attachment) |
| `session-reminder.tsx` | Cron 24h before session | Mentor + Learner |
| `password-reset.tsx` | Forgot password | User |

All sent via Resend from `LIFFT <hello@mail.lifft-dev.co.uk>`.

---

## Google Calendar Integration

```
Mentor connects Google Calendar:
→ GET /api/auth/google-calendar → OAuth consent screen
→ GET /api/auth/google-calendar/callback → store tokens in calendar_integrations
→ registerWatchChannel() → Google push notifications enabled (7-day channel)

On calendar change:
→ POST /api/webhooks/google-calendar (ping from Google)
→ Authenticated via (channel_id, resource_id) pair in DB
→ syncMentorCalendar() → incremental sync via syncToken
→ 410 Gone → forceFullSync() → replace_mentor_blockers RPC

Channel renewal (daily cron):
→ GET /api/cron/calendar-maintenance
→ Find integrations where renew_at <= now (renewed at 50% of 7-day lifetime)
→ registerWatchChannel() + forceFullSync() per mentor
→ invalid_grant → markIntegrationRevoked()
```

---

## Stripe Connect Flow

```
Mentor sets up payouts:
→ POST /api/mentor/stripe/onboard
→ Creates Stripe Express account (GB, individual) on first call, reuses on retry
→ Mints Account Link → browser redirected to Stripe hosted onboarding
→ Return URL: /dashboard?payouts=submitted
→ Refresh URL: GET /api/mentor/stripe/refresh (mints fresh Account Link)

Account verification:
→ Stripe fires account.updated webhook
→ POST /api/webhooks/stripe → charges_enabled = account.charges_enabled && account.payouts_enabled
→ mentor_profiles.charges_enabled updated
→ Slots become bookable only when charges_enabled = true

Platform fee: 15% (application_fee_amount on payment_intent_data)
```

---

## Environment Variables

| Variable | Used In |
|---|---|
| `DATABASE_URL` | lib/auth/index.ts (pg Pool) |
| `NEXT_PUBLIC_SUPABASE_URL` | lib/supabase/* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lib/supabase/server.ts |
| `SUPABASE_SERVICE_ROLE_KEY` | lib/supabase/admin.ts |
| `BETTER_AUTH_SECRET` | lib/auth/index.ts |
| `BETTER_AUTH_URL` | lib/auth/index.ts, API routes |
| `GOOGLE_CLIENT_ID` | lib/auth/index.ts (social provider) |
| `GOOGLE_CLIENT_SECRET` | lib/auth/index.ts |
| `GOOGLE_CALENDAR_CLIENT_ID` | lib/calendar/client.ts |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | lib/calendar/client.ts |
| `GOOGLE_CALENDAR_REDIRECT_URI` | OAuth callback |
| `RESEND_API_KEY` | lib/resend/client.ts |
| `STRIPE_SECRET_KEY` | API routes (sessions, onboard, webhooks) |
| `STRIPE_WEBHOOK_SECRET` | app/api/webhooks/stripe/route.ts |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | app/api/webhooks/stripe/route.ts |
| `CRON_SECRET` | app/api/cron/*/route.ts |
| `ADMIN_EMAILS` | proxy.ts, lib/auth/require-admin.ts (comma-separated) |

---

## Cron Jobs (vercel.json)

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/calendar-maintenance` | `0 3 * * *` (3am UTC daily) | Renew Google Calendar watch channels + full sync |
| `/api/cron/session-reminders` | `0 8 * * *` (8am UTC daily) | Send 24h reminder emails |

Plus pg_cron inside Postgres: `release_expired_holds()` every 10 minutes.

---

## Known Issues / Pending Work

| Item | Location | Notes |
|---|---|---|
| Magic link → `/login` bug | `proxy.ts:40` | `/onboarding` is blocked without session; magic link redirect lands before cookie is set. Fix: remove `/onboarding` from the no-session guard. |
| PayoutBanner not wired | `app/(dashboard)/dashboard/page.tsx` | Component exists, not imported into dashboard |
| Earnings/Payments not in sidebar nav | `components/layout/sidebar.tsx` | Routes exist, no nav links |
| `payments/page.tsx` select syntax | `app/(dashboard)/payments/page.tsx:35` | Missing closing `)` on Supabase select string |
| `stripe/refresh` typo | `app/api/mentor/stripe/refresh/route.ts:49` | `"refersh"` should be `"refresh"` |
| `types/database.types.ts` stale | `types/database.types.ts` | Run `supabase gen types typescript --project-id wbfurlkihxgpgrgbcdcc > types/database.types.ts` |
| Agora stub | `lib/agora/client.ts` | Phase 5 — not implemented |
| Legacy feature folders | `features/appointments`, `features/coaches`, `features/clients` | Pre-refactor stubs, unused |
| Legacy hooks | `hooks/` | Pre-refactor, unused |
| Legacy types | `types/appointment.ts`, `types/client.ts`, etc. | Pre-refactor, unused |
| Video join button | `app/(dashboard)/sessions/[id]/page.tsx` | Placeholder — Phase 5 |
| Chat | `app/(dashboard)/messages/` | Stub — Phase 6 |

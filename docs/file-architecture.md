# LIFFT Labs — File Architecture

Last updated: 2026-07-09  
Framework: Next.js 15 App Router  
Language: TypeScript

---

## Top-Level

```
LIFT/
├── app/                    # Next.js App Router — pages and API routes
├── components/             # Shared UI components
├── features/               # Feature-scoped logic (queries, mutations, schemas, components)
├── lib/                    # Third-party service clients and auth config
├── hooks/                  # React hooks
├── emails/                 # React Email templates
├── types/                  # Shared TypeScript types
├── utils/                  # Pure utility functions
├── public/                 # Static assets
├── supabase/               # DB migrations and config
├── docs/                   # Project documentation
├── proxy.ts                # Next.js middleware (auth + role routing)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## `app/` — Pages and API Routes

Next.js App Router. Route groups `(auth)`, `(dashboard)`, `(marketing)` apply shared layouts without affecting the URL.

```
app/
├── layout.tsx                          # Root layout (fonts, globals)
├── globals.css                         # Tailwind base styles + custom animations
├── favicon.ico
│
├── (auth)/                             # Auth layout — no sidebar
│   ├── layout.tsx
│   ├── login/page.tsx                  # Email + password, two-step
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── signup/
│   │   ├── page.tsx                    # Role picker — learner or mentor
│   │   ├── learner/page.tsx            # Learner signup (email + OTP verification)
│   │   └── mentor/
│   │       ├── page.tsx                # Mentor application form
│   │       └── applied/page.tsx        # Confirmation screen after applying
│   └── onboarding/
│       ├── learner/page.tsx            # 3-step chip selector → writes learner_profiles
│       └── mentor/page.tsx             # 4-step form → writes mentor_profiles + sets password
│
├── (dashboard)/                        # Dashboard layout — sidebar always present
│   ├── layout.tsx                      # Loads session, renders Sidebar
│   ├── dashboard/page.tsx              # Home — mentor or learner view
│   ├── admin/
│   │   └── mentors/page.tsx            # Admin panel — review mentor applications
│   ├── appointments/
│   │   ├── page.tsx                    # Sessions list (legacy, needs rebuild)
│   │   └── [id]/page.tsx              # Session detail (legacy)
│   ├── coaches/
│   │   ├── page.tsx                    # Browse mentors (legacy)
│   │   └── [id]/page.tsx              # Mentor profile (legacy)
│   └── messages/
│       ├── page.tsx                    # Conversations list (legacy)
│       └── [id]/page.tsx              # Chat thread (legacy)
│
├── (marketing)/                        # Public marketing pages
│   ├── layout.tsx                      # Nav + footer
│   ├── page.tsx                        # Landing page
│   └── about/page.tsx
│
└── api/                                # API route handlers (all use supabaseAdmin)
    ├── auth/
    │   ├── [...all]/route.ts           # Better Auth catch-all handler
    │   ├── google-calendar/
    │   │   ├── route.ts                # Initiates Google Calendar OAuth
    │   │   └── callback/route.ts       # Handles OAuth callback, stores tokens, registers webhook
    │   ├── login/route.ts              # Legacy (unused)
    │   ├── logout/route.ts             # Legacy (unused)
    │   └── signup/route.ts             # Legacy (unused)
    ├── mentors/
    │   ├── apply/route.ts              # POST — submit mentor application
    │   ├── approve/route.ts            # POST — send magic link approval email  ⚠️ missing session/admin check + status update
    │   ├── reject/route.ts             # POST — send rejection email            ⚠️ missing session/admin check + status update
    │   └── applications/
    │       └── route.ts                # GET — fetch pending applications        ⚠️ missing session/admin check
    ├── onboarding/
    │   ├── learner/route.ts            # POST — writes learner_profiles + sets role cookie
    │   └── mentor/route.ts             # POST — sets password + writes mentor_profiles + sets role cookie
    ├── webhooks/
    │   └── stripe/route.ts             # (Phase 4) POST — Stripe webhook handler (to build)
    ├── appointments/                   # Legacy — needs rebuild for Phase 3
    │   ├── route.ts
    │   └── [id]/route.ts
    ├── coaches/                        # Legacy — needs rebuild
    │   ├── route.ts
    │   ├── [id]/route.ts
    │   └── [id]/availability/route.ts
    ├── conversations/                  # Legacy — needs rebuild for Phase 6
    │   ├── route.ts
    │   └── [id]/messages/route.ts
    ├── clients/[id]/route.ts           # Legacy
    ├── signout/route.ts                # Legacy
    └── users/me/
        ├── route.ts                    # GET current user profile
        └── avatar/route.ts             # Avatar upload
```

---

## `components/` — Shared UI

```
components/
├── layout/
│   ├── sidebar.tsx                     # Collapsible sidebar — nav items, sign out, user chip
│   ├── nav.tsx                         # Marketing nav
│   └── footer.tsx                      # Marketing footer
├── marketing/
│   └── role-picker.tsx                 # Learner / mentor choice on signup entry
└── ui/                                 # shadcn/ui primitives
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    └── modal.tsx
```

---

## `features/` — Feature-Scoped Logic

Each feature owns its queries, mutations, Zod schemas, and local components. Pages in `app/` import from here.

```
features/
├── auth/
│   ├── schema.ts                       # Zod: emailSchema, loginSchema, signupSchema
│   ├── actions.ts                      # Server actions (legacy)
│   └── components/
│       ├── login-form.tsx              # (legacy, unused — login is in app/(auth))
│       └── signup-form.tsx             # (legacy, unused)
├── appointments/                       # Legacy — will be replaced by Phase 3 sessions
│   ├── schema.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── components/
│       ├── appointment-row.tsx
│       └── booking-form.tsx
├── coaches/                            # Legacy — will be replaced by Phase 3 mentor browse
│   ├── schema.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── components/
│       ├── coach-card.tsx
│       └── coach-profile-header.tsx
├── clients/                            # Legacy
│   ├── schema.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── components/
│       └── client-card.tsx
└── conversations/                      # Legacy — will be replaced by Phase 6 chat
    ├── schema.ts
    ├── queries.ts
    ├── mutations.ts
    └── components/
        ├── chat-input.tsx
        └── message-bubble.tsx
```

---

## `lib/` — Service Clients

```
lib/
├── auth/
│   ├── index.ts                        # Better Auth server config — email/password, OTP, magic link, Google OAuth, Resend email sending
│   ├── client.ts                       # Better Auth browser client (authClient)
│   └── require-admin.ts               # Admin role check helper
├── supabase/
│   ├── admin.ts                        # supabaseAdmin — service-role client, bypasses RLS. Used in all API routes.
│   └── server.ts                       # Supabase server client (legacy, rarely used)
├── calendar/
│   ├── sync.ts                         # syncMentorCalendar() — fetches Google Calendar events, calls replace_mentor_blockers / apply_blocker_delta RPCs
│   └── client.ts                       # Google OAuth2 client factory
├── resend/
│   └── client.ts                       # Resend email client instance
├── agora/
│   └── client.ts                       # Agora token generation (Phase 5)
└── utils.ts                            # cn() — Tailwind class merging utility
```

Note: `lib/supabase/client.ts` (Supabase browser client) was deleted — it was a footgun under ADR-010. All DB access goes through `supabaseAdmin` in API routes only.

---

## `emails/` — Transactional Email Templates

Built with React Email, rendered to HTML and sent via Resend.

```
emails/
├── verification.tsx                    # OTP verification code email
├── mentor-approved.tsx                 # Magic link sent to approved mentors
├── mentor-rejected.tsx                 # Rejection email
└── password-reset.tsx                  # Password reset link email
```

---

## `hooks/` — React Hooks

```
hooks/
├── use-user.ts                         # Current user from Better Auth session
├── use-appointments.ts                 # (legacy)
└── use-messages.ts                     # (legacy)
```

---

## `types/` — TypeScript Types

```
types/
├── database.types.ts                   # Auto-generated Supabase types (stale — regenerate after migrations)
├── appointment.ts                      # (legacy)
├── client.ts                           # (legacy)
├── coach.ts                            # (legacy)
└── conversation.ts                     # (legacy)
```

---

## `utils/`

```
utils/
└── format-date.ts                      # Date formatting helpers
```

---

## `supabase/` — Database

```
supabase/
├── config.toml                         # Supabase CLI config
└── migrations/
    ├── 20260611153703_initial_schema.sql                    # Core tables, enums, triggers
    ├── 20260618082740_rls_policies.sql                      # RLS policies (superseded by ADR-010)
    ├── 20260618125549_drop_auto_create_profile_trigger.sql
    ├── 20260618142954_add_primary_concern_to_learner_profiles.sql
    ├── 20260618144820_mentor_application_and_profile_updates.sql
    ├── 20260619083555_add_stripe_fields.sql
    ├── 20260624000000_learner_profiles_text_user_id.sql     # Drop FK to profiles, change to text
    ├── 20260625000000_mentor_profiles_text_user_id.sql      # Drop FK to profiles, change to text
    ├── 20260629000000_drop_auth_uid_policies.sql
    ├── 20260706000000_drop_unused_add_calendar_schema.sql   # Drop 9 legacy tables/6 enums, add calendar tables
    ├── 20260706000001_mentor_scheduling_settings.sql        # Add buffer/notice/caps to mentor_profiles
    └── 20260709000000_schema_cleanup_and_booking.sql        # Identity repair + full booking schema (see below)
```

### `20260709000000_schema_cleanup_and_booking.sql`

The big one. Covers:

- **btree_gist extension** — required for exclusion constraints mixing text equality with tstzrange overlap
- **`session_status` enum** — adds `expired` value (slots released when checkout abandoned)
- **FK repair** — `mentor_sessions`, `payments`, `conversation_participants`, `messages` all re-pointed from dead `profiles(id)` to `"user"(id)` as text
- **`messages` table** — dropped and recreated clean (was contaminated with Supabase Realtime internal columns); keyset pagination index added
- **`profiles` table** — dropped permanently, along with `handle_new_user` trigger and `user_role` enum
- **Exclusion constraint fix** — `WHERE (status IN ('pending', 'confirmed'))` so cancelled/expired sessions free up the slot
- **New columns** — `calendar_integrations.status`, `google_calendar_blockers.lifft_session_id`, `mentor_sessions.(google_event_id, slot_id, stripe_checkout_id, expires_at)`
- **`mentor_open_slots`** — mentor-published bookable slots; 4-state machine: `open → held → booked / withdrawn`; exclusion constraint prevents overlapping active slots; RLS enabled
- **`stripe_events`** — idempotency table for Stripe webhook processing; RLS enabled
- **Sync RPCs** (SECURITY DEFINER): `replace_mentor_blockers`, `apply_blocker_delta`, `reconcile_open_slots` — atomic blocker writes with advisory locks per mentor
- **Booking RPCs** (SECURITY DEFINER): `hold_slot`, `confirm_session`, `release_session`, `release_expired_holds` — slot state machine enforced at DB level

---

## `docs/`

```
docs/
├── tickets.md                          # Phase-by-phase feature tickets (current roadmap)
├── db-schema.md                        # Full live database schema with notes
├── file-architecture.md                # This file
├── engineering-notes.md                # Tech decisions, edge cases, UK/GDPR notes
├── api-routes.md                       # API route reference
├── architecture.md                     # System architecture overview
├── schema.md                           # (older schema notes, superseded by db-schema.md)
├── debug-otp-email.md                  # Debug notes for OTP email issues
└── adr/                                # Architecture Decision Records
    ├── 001-supabase-as-backend.md
    ├── 002-profiles-extension-pattern.md
    ├── 003-pathways-vs-programs.md
    ├── 004-payments-in-pence.md
    ├── 005-better-auth.md
    ├── 006-otp-signup-only.md
    ├── 007-onboarding-under-auth.md
    ├── 008-rls-api-routes-security.md
    ├── 009-mentor-onboarding-flow.md
    └── 010-better-auth-supabase-no-rls.md
```

---

## `proxy.ts` — Middleware

Runs on every request before the page renders. Handles:

1. Unverified users → redirect to `/signup/learner`
2. No session + protected path → redirect to `/login`
3. Session + auth page → redirect to `/dashboard`
4. Session + no role cookie → checks `mentor_profiles`/`learner_profiles` to auto-restore role cookie
5. Non-admin hitting `/admin` → redirect to `/dashboard`
6. Admin email in `ADMIN_EMAILS` env var → sets role cookie to `admin`

---

## Key Conventions

- **All DB access goes through `supabaseAdmin`** in API routes. No client-side DB calls. `lib/supabase/client.ts` was deleted (ADR-010).
- **Role is stored in a `role` cookie** (`mentor` / `learner` / `admin`), set on onboarding completion and auto-restored by middleware on login.
- **`user.id` is a text field** (UUID-formatted string from `crypto.randomUUID`) — not a Postgres UUID type. All FK columns pointing at `user.id` are `text`.
- **`profiles` table is dropped.** All legacy references have been cleaned up in `20260709`. `learner_profiles` and `mentor_profiles` have proper FKs to `"user"(id)`.
- **RLS** is enabled on `messages`, `mentor_open_slots`, and `stripe_events` (no policies = blocked to anon/authenticated role). All other app tables rely on `supabaseAdmin` as the trust boundary. RPCs that write to these tables use `SECURITY DEFINER`.
- **Slot booking** is enforced at DB level — `hold_slot` RPC derives mentor_id from the slot row (not the caller), uses `FOR UPDATE` lock, and the exclusion constraint backstops any race condition.
- **Files marked as legacy** in `features/`, `hooks/`, `types/`, and some `app/api/` routes were built before the product pivot. They work but will be replaced in Phase 3–6.

## Pending / Known Issues

- `app/api/mentors/approve/route.ts`, `reject/route.ts`, `applications/route.ts` — all missing session check + admin role check; approve/reject don't update `mentor_applications.status`
- `lib/supabase/server.ts` — legacy, used by old routes only. Will be removed when legacy routes are rebuilt.
- `types/database.types.ts` — stale, generated before recent migrations. Run `supabase gen types typescript` to refresh.
- Phase 4 Stripe webhook handler (`/api/webhooks/stripe`) not yet built. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are in `.env.local`.

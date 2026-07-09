# LIFFT Labs — File Architecture

Last updated: 2026-07-08  
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
    │   ├── approve/route.ts            # POST — send magic link approval email
    │   ├── reject/route.ts             # POST — send rejection email
    │   ├── applications/
    │   │   ├── route.ts                # GET — fetch pending applications
    │   │   └── status/route.ts         # (unused)
    ├── onboarding/
    │   ├── learner/route.ts            # POST — writes learner_profiles + sets role cookie
    │   └── mentor/route.ts             # POST — sets password + writes mentor_profiles + sets role cookie
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
│   └── client.ts                       # Better Auth browser client (authClient)
├── supabase/
│   ├── admin.ts                        # supabaseAdmin — service-role client, bypasses RLS. Used in all API routes.
│   ├── client.ts                       # Supabase browser client (legacy, rarely used)
│   └── server.ts                       # Supabase server client (legacy)
├── calendar/
│   ├── sync.ts                         # syncMentorCalendar() — fetches Google Calendar events, upserts google_calendar_blockers
│   └── client.ts                       # Google OAuth2 client helper (if any)
├── resend/
│   └── client.ts                       # Resend email client instance
├── agora/
│   └── client.ts                       # Agora token generation (Phase 5)
└── utils.ts                            # cn() — Tailwind class merging utility
```

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
├── database.types.ts                   # Auto-generated Supabase types (may be stale)
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
    ├── 20260611153703_initial_schema.sql               # Core tables, enums, triggers
    ├── 20260618082740_rls_policies.sql                 # RLS policies (now disabled)
    ├── 20260618125549_drop_auto_create_profile_trigger.sql
    ├── 20260618142954_add_primary_concern_to_learner_profiles.sql
    ├── 20260618144820_mentor_application_and_profile_updates.sql
    ├── 20260619083555_add_stripe_fields.sql
    ├── 20260624000000_learner_profiles_text_user_id.sql  # Drop FK to profiles, change to text
    ├── 20260625000000_mentor_profiles_text_user_id.sql   # Drop FK to profiles, change to text
    ├── 20260629000000_drop_auth_uid_policies.sql
    ├── 20260706000000_drop_unused_add_calendar_schema.sql # Drop 9 tables/6 enums, add calendar tables
    └── 20260706000001_mentor_scheduling_settings.sql      # Add buffer/notice/caps to mentor_profiles
```

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

- **All DB access goes through `supabaseAdmin`** in API routes. No client-side DB calls.
- **Role is stored in a `role` cookie** (`mentor` / `learner` / `admin`), set on onboarding completion and auto-restored by middleware on login.
- **`user.id` is a text field** (UUID-formatted string from `crypto.randomUUID`) — not a Postgres UUID type.
- **Legacy `profiles` table** is dead. `learner_profiles` and `mentor_profiles` use `user_id text` with no FK.
- **Files marked as legacy** in `features/`, `hooks/`, `types/`, and some `app/api/` routes were built before the product pivot. They work but will be replaced in Phase 3–6.

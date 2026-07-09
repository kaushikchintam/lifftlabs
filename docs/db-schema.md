# LIFFT Labs — Database Schema

Last updated: 2026-07-08  
Database: Supabase (Postgres 17), region `eu-west-1`  
Auth: Better Auth (not Supabase native auth)

---

## Overview

The DB has two distinct groups of tables:

1. **Better Auth tables** — managed by the library, camelCase columns, never touch manually
2. **App tables** — our own schema, snake_case columns

RLS is disabled on all app tables. API routes using `supabaseAdmin` (service-role key) are the trust boundary.

---

## Better Auth Tables

### `user`
Stores every registered user. Created by Better Auth on signup.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | UUID-formatted string (via `crypto.randomUUID`) |
| `name` | text NOT NULL | Full name |
| `email` | text NOT NULL UNIQUE | |
| `emailVerified` | boolean NOT NULL | Set to true after OTP verification |
| `image` | text | Avatar URL |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

### `session`
Active login sessions.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `token` | text UNIQUE | Session token stored in cookie |
| `userId` | text → `user.id` | |
| `expiresAt` | timestamptz | |
| `ipAddress` | text | |
| `userAgent` | text | |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

### `account`
OAuth provider links and credential records per user.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `userId` | text → `user.id` | |
| `providerId` | text | `credential`, `google`, `magic-link` |
| `accountId` | text | Provider's user ID |
| `password` | text | Hashed, only for credential provider |
| `accessToken` | text | OAuth access token |
| `refreshToken` | text | OAuth refresh token |
| `accessTokenExpiresAt` | timestamptz | |
| `refreshTokenExpiresAt` | timestamptz | |
| `scope` | text | |
| `idToken` | text | |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

### `verification`
Temporary tokens for OTP codes and magic links.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `identifier` | text | Usually the email |
| `value` | text | The OTP code or magic link token |
| `expiresAt` | timestamptz | |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

---

## App Tables

### `profiles` ⚠️ LEGACY — DO NOT USE
Originally the core user table, referencing Supabase's `auth.users`. Since we migrated to Better Auth, `auth.users` is never populated. This table is effectively dead. Do not write to it. Several old FK references to it remain (see Known Issues).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK → `auth.users(id)` | Never populated with Better Auth |
| `role` | `user_role` enum | learner / mentor / admin |
| `full_name` | text | |
| `avatar_url` | text | |
| `bio` | text | |
| `linkedin_url` | text | |
| `stripe_customer_id` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated via trigger |

---

### `learner_profiles`
One row per learner. Written on onboarding completion.

| Column | Type | Notes |
|---|---|---|
| `user_id` | text PK | Better Auth `user.id` — no FK (intentional) |
| `current_position` | text | e.g. "Finance" |
| `target_role` | text | e.g. "Into medicine (graduate entry)" |
| `background` | text | |
| `primary_concern` | text | e.g. "Lost in the admissions maze" |
| `years_experience` | int | |
| `updated_at` | timestamptz | auto-updated via trigger |

**No FK to `user`** — the FK to `profiles(id)` was dropped in migration `20260624`. Role is inferred at runtime by checking whether a `learner_profiles` row exists for the user.

---

### `mentor_profiles`
One row per approved mentor. Written when mentor completes the onboarding flow after clicking the approval magic link.

| Column | Type | Notes |
|---|---|---|
| `user_id` | text PK | Better Auth `user.id` — no FK (intentional) |
| `specialty` | text[] | e.g. `["Into Medicine"]` |
| `one_liner` | text | Short bio shown to learners |
| `current_position` | text | |
| `years_in_healthcare` | int | |
| `is_verified` | boolean | Default false |
| `hourly_rate_pence` | int | e.g. 8000 = £80/hr |
| `available_days` | text[] | e.g. `["Monday", "Wednesday"]` |
| `stripe_account_id` | text | Stripe Connect account (Phase 4) |
| `buffer_minutes` | int NOT NULL | Default 15 — gap between sessions |
| `min_notice_hours` | int NOT NULL | Default 24 — minimum booking notice |
| `max_sessions_per_day` | int | null = unlimited |
| `max_sessions_per_week` | int | null = unlimited |
| `updated_at` | timestamptz | auto-updated via trigger |

---

### `mentor_applications`
Submitted by prospective mentors via `/signup/mentor`. Reviewed in the admin panel.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `full_name` | text NOT NULL | |
| `email` | text NOT NULL UNIQUE | |
| `linkedin_url` | text NOT NULL | |
| `status` | `application_status` enum | Default `pending`. Values: pending / approved / rejected |
| `reviewed_at` | timestamptz | |
| `reviewed_by` | uuid → `profiles(id)` | Legacy FK, not used in practice |
| `created_at` | timestamptz | |

**Flow:** Apply → admin approves in `/admin/mentors` → approval route sends magic link + updates status to `approved` → mentor clicks link → completes onboarding → `mentor_profiles` row created.

---

### `mentor_sessions`
A booked session between a mentor and a learner.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Used as Agora channel name |
| `mentor_id` | uuid → `profiles(id)` | ⚠️ Legacy FK — needs migration (Phase 3) |
| `learner_id` | uuid → `profiles(id)` | ⚠️ Legacy FK — needs migration (Phase 3) |
| `scheduled_at` | timestamptz | Session start |
| `ends_at` | timestamptz | Session end |
| `timezone` | text NOT NULL | Default `Europe/London` |
| `booking_range` | tstzrange | Generated column: `tstzrange(scheduled_at, ends_at)` — used for overlap detection |
| `duration_minutes` | int | Default 60 |
| `status` | `session_status` enum | pending / confirmed / completed / cancelled |
| `agora_channel` | text | Agora channel name for video |
| `notes` | text | |
| `created_at` | timestamptz | |

**Constraints:**
- `EXCLUDE USING gist (mentor_id WITH =, booking_range WITH &&)` — prevents double-booking at DB level
- GiST index on `booking_range`

---

### `mentor_availability`
Mentor's weekly working hours template. Used to compute available slots for booking.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `mentor_id` | text NOT NULL | Better Auth `user.id` |
| `day_of_week` | int NOT NULL | 0=Sunday, 6=Saturday |
| `start_time` | time NOT NULL | e.g. `09:00` |
| `end_time` | time NOT NULL | e.g. `17:00` |
| `timezone` | text NOT NULL | Default `Europe/London` |
| `created_at` | timestamptz | |

**Unique constraint:** `(mentor_id, day_of_week, start_time)`

---

### `calendar_integrations`
Google Calendar OAuth tokens and webhook state per mentor.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `mentor_id` | text NOT NULL | Better Auth `user.id` |
| `provider` | text NOT NULL | Default `google` |
| `access_token` | text NOT NULL | Rotated automatically by googleapis |
| `refresh_token` | text NOT NULL | Long-lived, preserve across re-auth |
| `token_expiry` | timestamptz NOT NULL | When access_token expires |
| `calendar_id` | text | Usually `primary` |
| `channel_id` | uuid | Google push notification channel ID |
| `resource_id` | text | Google-assigned resource ID for the channel |
| `channel_expiry` | timestamptz | Hard expiry of the push channel (max ~7 days) |
| `renew_at` | timestamptz | Set to 50% of channel lifetime — renew before expiry |
| `sync_token` | text | Google incremental sync token. null = do a full sync |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Unique constraint:** `(mentor_id, provider)`

**How sync works:**
- First connect: full sync (no syncToken), stores `nextSyncToken`
- Subsequent: incremental sync using `syncToken`, only returns changes
- 410 Gone: syncToken expired — clear it, fall back to full sync
- Webhook fires → `syncMentorCalendar(mentorId)` runs incremental sync
- Channel expires → renewal cron renews before `renew_at`

---

### `google_calendar_blockers`
Cached busy time blocks from Google Calendar. 30-day rolling window.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `mentor_id` | text NOT NULL | Better Auth `user.id` |
| `google_event_id` | text NOT NULL | Google's event ID |
| `blocker_range` | tstzrange NOT NULL | `[start, end)` — used for slot availability queries |
| `updated_at` | timestamptz | |

**Unique constraint:** `(mentor_id, google_event_id)`  
**GiST index on `blocker_range`** — fast overlap queries  
**GiST index on `mentor_id`**

**On incremental sync:** cancelled events → delete row. New/updated events → upsert.  
**On full sync (410):** RPC `replace_calendar_blockers` atomically replaces entire set (Phase 3, not yet built).

---

### `payments`
Stripe payment records.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → `profiles(id)` | ⚠️ Legacy FK — needs migration (Phase 4) |
| `amount_pence` | int NOT NULL | e.g. 8000 = £80 |
| `currency` | text | Default `gbp` |
| `stripe_payment_intent_id` | text UNIQUE | |
| `item_type` | `payment_item_type` enum | `session` |
| `session_id` | uuid → `mentor_sessions(id)` | |
| `status` | `payment_status` enum | pending / succeeded / failed / refunded |
| `created_at` | timestamptz | |

---

### `conversations`
A chat thread between two users.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `created_at` | timestamptz | |
| `last_message_at` | timestamptz | Updated on new message |

### `conversation_participants`
Join table — who is in each conversation.

| Column | Type | Notes |
|---|---|---|
| `conversation_id` | uuid PK → `conversations.id` | |
| `user_id` | uuid PK → `profiles(id)` | ⚠️ Legacy FK |

### `messages`
Individual chat messages. Note: this table has extra columns from Supabase Realtime's internal schema (`topic`, `extension`, `event`, `private`, `payload`, `inserted_at`) — these are not written by application code.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `conversation_id` | uuid → `conversations.id` | |
| `sender_id` | uuid → `profiles(id)` | ⚠️ Legacy FK |
| `content` | text NOT NULL | |
| `created_at` | timestamptz | |
| `read_at` | timestamptz | null = unread |

---

## Enums

| Enum | Values |
|---|---|
| `user_role` | `learner`, `mentor`, `admin` |
| `session_status` | `pending`, `confirmed`, `completed`, `cancelled` |
| `payment_status` | `pending`, `succeeded`, `failed`, `refunded` |
| `payment_item_type` | `session`, `program` |
| `application_status` | `pending`, `approved`, `rejected` |

**Dropped enums** (removed in migration `20260706`): `milestone_type`, `content_type`, `cohort_status`, `member_status`, `progress_status`, `portfolio_item_type`

---

## Known Issues / Technical Debt

### Legacy `profiles` FKs
These tables still have FKs pointing at `profiles(id)` which is a dead table:
- `mentor_sessions.mentor_id` and `mentor_sessions.learner_id`
- `payments.user_id`
- `conversation_participants.user_id`
- `messages.sender_id`

These will need migrations to drop and re-point to `user.id` (as text) before Phase 3 (sessions) and Phase 6 (chat) can go live.

### `mentor_sessions.booking_range`
`booking_range` is a generated column (`GENERATED ALWAYS AS ... STORED`). It is computed from `scheduled_at` and `ends_at` and cannot be written directly. The exclusion constraint uses this column for double-booking prevention.

### `mentor_applications.reviewed_by`
Still has a FK to `profiles(id)`. In practice this is never written. Low priority.

---

## Dropped Tables (Phase 2 cleanup)
Removed in migration `20260706000000`:
`pathways`, `milestones`, `microlearning_modules`, `programs`, `cohorts`, `cohort_members`, `user_pathway_progress`, `milestone_completions`, `portfolio_items`

# Database Schema

The schema lives in `supabase/migrations/`. The full initial schema is in `20260611153703_initial_schema.sql`.

TypeScript types are auto-generated at `types/database.types.ts` — never edit this file manually.

## Profiles (Core User Data)

Every user has one `profiles` row, created automatically via a database trigger on `auth.users` insert. Role-specific fields live in separate extension tables to keep `profiles` clean.

```
auth.users          (Supabase-owned)
    ↓ 1:1
profiles            role, full_name, avatar_url, bio
    ↓ 1:1
learner_profiles    current_position, target_role, background, linkedin_url
mentor_profiles     specialty, current_position, years_in_healthcare, hourly_rate_pence
```

See [ADR 002](adr/002-profiles-extension-pattern.md) for why this pattern was chosen.

## Pathways & Content

```
pathways
  └── milestones          (ordered via order_index, unique per pathway)
        └── microlearning_modules   (can belong to a milestone or directly to a pathway)
```

`microlearning_modules` has both `pathway_id` and `milestone_id`. A module must always belong to a pathway; the milestone is optional (for modules not tied to a specific milestone step).

## Programs & Cohorts

```
programs  (mentor + pathway + price)
  └── cohorts   (a specific intake/run of the program)
        └── cohort_members  (learners enrolled, composite PK)
```

## Progress Tracking

```
user_pathway_progress   (one row per learner per pathway — tracks overall status)
  └── milestone_completions  (one row per completed milestone — unique per user+milestone)
        └── portfolio_items  (artefacts linked to completions)
```

`current_milestone_id` on `user_pathway_progress` is a convenience cache — the source of truth is `milestone_completions`. Keep them in sync when updating progress.

## Messaging

```
conversations
  ├── conversation_participants  (composite PK — who is in the conversation)
  └── messages   (sender_id, content, read_at)
```

Note: `messages.read_at` is a single timestamp — this works for 1:1 conversations only. If group messaging is added in future, this needs to be replaced with a `message_reads` junction table.

## Payments

All monetary values are stored as integers in pence (GBP). See [ADR 004](adr/004-payments-in-pence.md).

`payments` has both `program_id` and `session_id` — only one will be set depending on `item_type` (`program` or `session`).

## Enums

| Enum | Values |
|---|---|
| `user_role` | learner, mentor, admin |
| `milestone_type` | exam_prep, application, interview, clinical, document, custom |
| `content_type` | video, article, quiz, exercise |
| `cohort_status` | forming, active, completed |
| `member_status` | active, graduated, dropped |
| `progress_status` | active, paused, completed |
| `portfolio_item_type` | milestone, certificate, project, reflection |
| `session_status` | pending, confirmed, completed, cancelled |
| `payment_item_type` | session, program |
| `payment_status` | pending, succeeded, failed, refunded |

## Triggers

| Trigger | Table | What it does |
|---|---|---|
| `on_auth_user_created` | `auth.users` | Auto-creates a `profiles` row with role `learner` on signup |
| `set_*_updated_at` | profiles, learner_profiles, mentor_profiles | Auto-updates `updated_at` on row change |

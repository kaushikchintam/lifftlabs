# LIFT — Architecture Overview

LIFT is a healthcare career transition platform that connects learners (people switching into healthcare roles) with mentors (experienced healthcare professionals). Learners follow structured pathways, track progress through milestones, and can join mentor-led cohort programs.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Payments | Stripe (via `payments` table) |
| Video sessions | Agora |

## Folder Structure

```
app/                    # Next.js App Router pages
  (auth)/               # Login, signup — no dashboard shell
  (dashboard)/          # Authenticated app — appointments, messages, onboarding
  (marketing)/          # Public-facing pages
  api/                  # API route handlers

features/               # Feature modules, each containing:
  <feature>/
    components/         # UI components scoped to this feature
    queries.ts          # Read queries (server)
    mutations.ts        # Write operations
    schema.ts           # Zod validation schemas

lib/
  supabase/
    client.ts           # Browser Supabase client (Client Components)
    server.ts           # Server Supabase client (Server Components, API routes)
  agora/                # Agora video session helpers

types/
  database.types.ts     # Auto-generated from Supabase schema (do not edit manually)

utils/                  # Shared utility functions
supabase/
  migrations/           # Versioned SQL migration files
```

## Core Concepts

### Pathways
A pathway is a structured learning journey made up of ordered milestones and microlearning modules. Pathways are content — reusable, followable by any learner independently.

### Programs
A program is a mentor wrapping a pathway into a structured group offering: a cohort, a price, and defined start/end dates. A learner can follow a pathway solo, or join a mentor's program based on that same pathway.

### Cohorts
A cohort is a group of learners enrolled in a program together. Mentors can run multiple cohorts per program (e.g. different intakes).

### Profiles
Every authenticated user has a `profiles` row. Role-specific data lives in separate extension tables (`learner_profiles`, `mentor_profiles`). See [ADR 002](adr/002-profiles-extension-pattern.md).

## Data Flow

```
auth.users (Supabase)
    ↓ trigger (auto-created on signup)
profiles (role, name, avatar)
    ↓
learner_profiles / mentor_profiles (role-specific data)
```

## Key Relationships

```
mentor → programs → cohorts → cohort_members (learners)
pathway → milestones → microlearning_modules
learner → user_pathway_progress → milestone_completions → portfolio_items
mentor + learner → mentor_sessions
users → conversations → messages
```

## Database Types

TypeScript types are auto-generated from the Supabase schema. After any schema change, regenerate with:

```bash
supabase gen types typescript --linked > types/database.types.ts
```

Never edit `types/database.types.ts` manually.

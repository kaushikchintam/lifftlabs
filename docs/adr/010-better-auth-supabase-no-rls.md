# ADR 010 — Better Auth + Supabase: No RLS, API Routes as Trust Boundary

## Context

The project uses Better Auth for authentication and Supabase as a plain PostgreSQL database. The initial schema was written for Supabase Auth, which issues JWTs that Supabase's RLS engine can read via `auth.uid()`. When we switched to Better Auth, every RLS policy in the schema became permanently broken.

## Why `auth.uid()` does not work with Better Auth

`auth.uid()` reads the user ID from a Supabase Auth JWT token embedded in the request. Better Auth issues its own session tokens — it never writes to `auth.users` and never produces a Supabase-compatible JWT. As a result, `auth.uid()` always returns `NULL` in this codebase. Every existing RLS policy that checks `auth.uid() = user_id` silently blocks all access.

## Why we don't need RLS

RLS is designed for architectures where the browser talks directly to Supabase:

```
Browser → Supabase REST API → RLS check → DB
```

This is not our architecture. Every database write goes through a Next.js API route:

```
Browser → POST /api/... → session check → supabaseAdmin → DB
```

`supabaseAdmin` uses the service role key, which **bypasses RLS unconditionally**. Even perfectly written RLS policies would be skipped on every write in this codebase.

The API route is the trust boundary:
1. `auth.api.getSession()` verifies the Better Auth session
2. The route validates the request body
3. `supabaseAdmin` writes to the DB

No client code ever touches `supabaseAdmin` or the service role key.

## Decision

- **Drop all RLS policies** that use `auth.uid()` — they are permanently broken and give a false sense of security
- **Enable RLS with no policies** on all app tables — this means only `supabaseAdmin` (service role) can access the tables; any accidental direct client access via the anon key is blocked by default
- **Do not attempt to wire Better Auth sessions into Supabase's RLS** — this would require issuing custom JWTs from Better Auth that Supabase can verify, adding significant complexity for no practical gain given our architecture

## The `profiles` table problem

The initial schema created a `profiles` table referencing `auth.users(id)`:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ...
);
```

Since Better Auth never writes to `auth.users`, this table is permanently empty and its FK tree is broken. Every app table that references `profiles(id)` — `pathways`, `programs`, `user_pathway_progress`, `milestone_completions`, `cohort_members`, `mentor_sessions`, `conversations`, `messages`, `payments`, `portfolio_items` — cannot accept any rows because the FK to `profiles` can never be satisfied.

## Table migration required before Phase 3

All tables must be migrated from:
- `uuid` user_id columns referencing `profiles(id)`
→ to:
- `text` user_id columns with no FK constraint (holding Better Auth string IDs)

The `profiles` table itself should be dropped. Its data (full_name, avatar_url, bio) is covered by Better Auth's own `user` table. Fields that were moved to `profiles` in earlier migrations need to be redistributed:
- `linkedin_url` → back to `learner_profiles`
- `stripe_customer_id` → `learner_profiles` (for Stripe Customer ID) and `mentor_profiles` already has `stripe_account_id`

## Security model going forward

| Layer | Mechanism |
|---|---|
| Authentication | Better Auth session cookie validated via `auth.api.getSession()` in every API route |
| Authorization | Role cookie (`role=learner\|mentor\|admin`) checked in `proxy.ts` for route-level access |
| Data access | `supabaseAdmin` (service role) used for all writes, after session is verified |
| DB-level protection | RLS enabled with no policies — blocks anon key access; service role bypasses |

RLS is a safety net, not the primary security layer.

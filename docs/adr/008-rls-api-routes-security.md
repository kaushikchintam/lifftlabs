# ADR 008 — API routes as security boundary, RLS disabled for Better Auth tables

## Decision

Row Level Security (RLS) is disabled on tables where writes are handled by Better Auth users. Authorization is enforced at the API route level instead.

## Reason

All RLS policies were written using `auth.uid()` — Supabase's built-in auth function. Since the app uses Better Auth (not Supabase Auth), `auth.uid()` always returns `NULL`. This means every RLS policy was silently failing to protect anything — inserts and reads were either blocked entirely (anon key) or unprotected (service role key).

The policies gave a false sense of security without providing any actual protection.

## How security is enforced instead

Every write goes through a server-side API route (`app/api/...`). Each route:
1. Calls `auth.api.getSession({ headers: req.headers })` to verify the Better Auth session
2. Returns `401 Unauthorized` if no valid session exists
3. Uses the Supabase service role key (bypasses RLS) only after the session check passes

This means the API layer is the trust boundary — not the database.

## Future path

RLS can be re-enabled properly by:
1. Generating a Supabase-compatible JWT from the Better Auth session token
2. Passing it to the Supabase client via `supabase.auth.setSession()`
3. Rewriting RLS policies to check the JWT claims instead of `auth.uid()`

This is deferred until the app is closer to production. The API route pattern is sufficient and more explicit for the current phase.

## Affected tables

- `learner_profiles` — RLS dropped, writes via `/api/onboarding/learner`
- All other tables — RLS policies exist but are non-functional with Better Auth. To be addressed before production.

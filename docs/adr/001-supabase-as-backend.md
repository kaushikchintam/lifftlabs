# ADR 001 — Supabase as Backend

## Status
Accepted

## Context
LIFT needs a backend that handles authentication, a relational database, file storage, and realtime capabilities. The team is small and needs to move fast without managing infrastructure.

## Decision
Use Supabase as the primary backend.

## Reasons
- Postgres under the hood — full relational database with foreign keys, enums, triggers, and row-level security
- Built-in auth with SSR support via `@supabase/ssr`
- Auto-generated TypeScript types from the schema keep the frontend in sync
- Row Level Security (RLS) lets us enforce data access rules at the database level rather than in application code
- Realtime subscriptions built in — useful for messaging and session status
- Storage for user avatars and portfolio evidence files
- Supabase CLI enables local development and versioned migrations

## Consequences
- Tied to Supabase's managed Postgres — migrating away would require exporting data and rewriting the client layer
- RLS policies must be written and maintained alongside schema changes
- Free tier has usage limits; production will need a paid plan

# ADR 005 — Better Auth for Authentication

## Status
Accepted

## Context
Phase 1 used Supabase Auth via `@supabase/ssr` for authentication. This created a tight coupling between auth and the Supabase client — session handling, cookie management, and route protection were all tied to Supabase's auth layer. As requirements grew (email OTP verification, Google OAuth, Apple OAuth, mentor magic links, future NHS Login via OIDC), Supabase Auth's constraints became limiting:

- Email OTP flows require workarounds in Supabase Auth
- Custom email templates are not natively supported without Edge Functions
- NHS Login (OIDC) is not a supported provider
- Session handling in Next.js 16 (proxy-based, not middleware) added friction with `@supabase/ssr`

## Decision
Replace Supabase Auth with Better Auth, using Supabase Postgres as the database adapter via a direct `pg` connection.

## Reasons
- Native email OTP plugin with `sendVerificationOTP` hook — plugs directly into our Resend + React Email setup
- Full OAuth support including custom OIDC providers (required for NHS Login)
- Self-hosted — no vendor lock-in on the auth layer
- Session tables live in our own Supabase Postgres database alongside app data
- Clean separation: Better Auth owns identity, Supabase JS client owns data queries
- Next.js 16 proxy integration is straightforward via `auth.api.getSession()`

## Consequences
- Better Auth manages its own `user`, `session`, `account`, and `verification` tables — separate from the `profiles` table which remains the app's source of truth for user data
- `@supabase/ssr` removed; Supabase JS client is now DB-only (no auth methods called on it)
- OAuth provider credentials (Google, Apple, Facebook) must be managed and rotated manually — no dashboard abstraction
- Apple OAuth and Facebook OAuth deferred until production domain is available
- NHS Login (OIDC) wired in a future phase when NHS developer credentials are obtained
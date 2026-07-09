# ADR 007 — Onboarding lives under (auth), not (dashboard)

## Decision

Learner and mentor onboarding pages (`/onboarding/learner`, `/onboarding/mentor`) are placed under the `(auth)` route group, not `(dashboard)`.

## Reason

At the point of onboarding, the user has verified their email but has no profile row yet (`learner_profiles` or `mentor_profiles` doesn't exist). Placing onboarding under `(dashboard)` would expose them to the dashboard layout, shell, and any data-fetching hooks that assume a complete profile — causing errors or broken UI.

The clean boundary is:
- `(auth)` — getting into the app: signup, login, OTP, onboarding
- `(dashboard)` — inside the app: requires a complete profile to exist

Onboarding completes by writing the profile row, then redirecting to `(dashboard)`. That redirect is the gate.

## Consequences

- Deleted `app/(dashboard)/onboarding/client/page.tsx` and `app/(dashboard)/onboarding/coach/page.tsx` (scaffold leftovers)
- Onboarding pages go under `app/(auth)/onboarding/learner/page.tsx` and `app/(auth)/onboarding/mentor/page.tsx`
- `(auth)/layout.tsx` stays bare — no nav, no sidebar

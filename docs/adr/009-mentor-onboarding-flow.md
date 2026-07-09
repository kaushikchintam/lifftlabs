# ADR 009 — Mentor Onboarding Flow and Password Setup

## The full flow

```
/signup/mentor          → inserts row into mentor_applications (no account created)
         ↓
Admin approves          → POST /api/mentors/approve
         ↓
auth.api.signInMagicLink → Better Auth creates user, generates magic link
         ↓
sendMagicLink callback  → renders MentorApprovalEmail, sends via Resend (profileLink = magic link URL)
         ↓
Mentor clicks link      → Better Auth creates session, redirects to /onboarding/mentor
         ↓
Steps 1–3               → specialty, availability, hourly rate (UI only, nothing saved yet)
         ↓
Step 4                  → mentor sets password (UI)
         ↓
Submit                  → POST /api/onboarding/mentor
         ↓
auth.api.setPassword    → sets password on Better Auth user table (hashed)
         ↓
mentor_profiles insert  → specialty, one_liner, available_days, hourly_rate_pence saved to Supabase
         ↓
router.push("/dashboard")
```

## Decisions

### Account created at approval, not application

The mentor application form (`/signup/mentor`) only inserts a row into `mentor_applications`. No Better Auth account is created at this point. The account is created when the admin approves — `auth.api.signInMagicLink` with `disableSignUp: false` creates the user if they don't exist.

Why: mentors are manually reviewed. Creating an account before approval would mean rejected applicants have orphaned accounts that need cleanup. Creating at approval time keeps the user table clean — only approved mentors exist as users.

### Magic link as the first authentication

The mentor has no password when approved. A magic link is the only way to authenticate them for the first time without requiring them to set a password blind (with no prior login). The link authenticates them and deposits them directly into the onboarding flow.

### `isAdminApproval` guard on `sendMagicLink`

`sendMagicLink` is the Better Auth callback that fires whenever `signInMagicLink` is called — including from the client via `authClient.signIn.magicLink`. Without a guard, anyone could call that from the browser and trigger the `MentorApprovalEmail` being sent to any email address.

The guard:
```ts
if (!data.metadata?.isAdminApproval) return;
```

Only the approve route passes `isAdminApproval: true` in metadata. Client-side calls have no metadata and are silently dropped — no email sent, no error returned.

### Password set server-side via `auth.api.setPassword`

Better Auth marks `setPassword` as `serverOnly`. It cannot be called from the client. This is intentional — if it were client-accessible, a hijacked session token (XSS, stolen cookie) would be enough to permanently lock the real user out by setting a new password.

On the server, Better Auth also validates that the user has no existing password before setting one — the magic-link-to-credentials upgrade is a one-way, validated operation. It hashes the password itself; the plaintext never touches `mentor_profiles` or any application table.

The password is destructured from the request body in `/api/onboarding/mentor` and passed directly to `auth.api.setPassword`. It is never logged, stored, or forwarded anywhere else.

### All onboarding data submitted in one request

Steps 1–3 are UI-only state. Nothing is written to the database until the mentor hits Submit on step 4. Everything — password and profile data — is sent in a single POST to `/api/onboarding/mentor`, which calls `setPassword` then inserts the `mentor_profiles` row.

Why: avoids partial saves. If the mentor drops off mid-onboarding, no incomplete `mentor_profiles` row exists. The onboarding is atomic from the database's perspective.

## Production hardening needed

`auth.api.setPassword` can throw if Better Auth rejects the password (e.g. too short per its internal config). Currently this bubbles up as an unhandled 500. The frontend validates `password.length < 8` so this shouldn't happen in normal use, but before production the route should:

1. Wrap `setPassword` in a try/catch
2. Return a `400` with a user-facing error message if it fails
3. Not proceed to the `mentor_profiles` insert if the password step failed

# Debug Log: OTP Email Not Sending on Signup

## Summary

After wiring Better Auth's `emailOTP` plugin to the learner signup flow, the OTP email was never delivered. This document covers what we tried, what failed, and what fixed it.

---

## The Setup

`lib/auth/index.ts` had the `emailOTP` plugin configured with:

```ts
plugins: [
  emailOTP({
    sendVerificationOnSignUp: true,
    overrideDefaultEmailVerification: true,
    async sendVerificationOTP({ email, otp, type }) {
      if (type === "email-verification") {
        const html = await render(React.createElement(VerificationEmail, { code: otp }));
        resend.emails.send({ ... });
      }
    },
  }),
],
```

The expectation was that Better Auth would automatically call `sendVerificationOTP` when a user signed up via `authClient.signUp.email()`.

---

## What Failed and Why

### Bug 1: Missing `await` on `resend.emails.send()`

The send call was fire-and-forget — no `await`. Any Resend error was silently swallowed and the email never sent.

**Fix:**
```ts
// before
resend.emails.send({ ... });

// after
await resend.emails.send({ ... });
```

### Bug 2: `sendVerificationOnSignUp` hook never fires

Even after fixing the `await`, no email arrived and no logs appeared. Adding `console.log` inside `sendVerificationOTP` confirmed the function was **never being called** at all.

**Root cause:** Better Auth's `emailOTP` plugin does not hook into `emailAndPassword` signups automatically. `sendVerificationOnSignUp: true` did not trigger for users created via `signUp.email()`. The two plugins don't connect.

### Bug 3: Renaming `index.ts` → `index.tsx` (red herring)

We attempted to rename the file to `.tsx` to use JSX syntax directly for the `render()` call, thinking that was the issue. It wasn't — the `React.createElement` approach in `.ts` is valid. Renamed it back.

---

## What Fixed It

Instead of relying on the plugin hook, we manually call `sendVerificationOtp` from the client immediately after a successful signup:

**`app/(auth)/signup/learner/page.tsx`:**
```ts
const { error: authError } = await authClient.signUp.email({
  name: fullName,
  email,
  password,
});
if (authError) {
  setError(authError.message ?? "Something went wrong. Please try again.");
  return;
}
// Manually trigger OTP — the plugin hook doesn't fire for emailAndPassword signups
await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
setShowOtp(true);
```

**`lib/auth/index.ts`** — removed the now-redundant options:
```ts
// removed
sendVerificationOnSignUp: true,
overrideDefaultEmailVerification: true,
```

The `sendVerificationOTP` function in `index.ts` still handles the actual email send — it's just triggered from the client now rather than the plugin hook.

---

## Resend Setup Note

During testing, emails weren't delivering because the `from` address was set to `login@lifftlabs.com` — a domain not yet verified in Resend. Switched to Resend's test sender for development:

```ts
from: "LIFFT LABS <onboarding@resend.dev>",
```

Resend's free plan restricts outbound emails to the account owner's email only (`kaushikchintam23@gmail.com`). Switch the `from` address back to the verified domain once `lifftlabs.com` is set up in Resend.

---

---

## Bug 4: Proxy blocking `/api/auth` for unverified users (2026-07-01)

After adding an `emailVerified` check to `proxy.ts` to prevent unverified users from reaching protected routes, the OTP send started silently failing again.

**Root cause:** The proxy check was intercepting the `sendVerificationOtp` API call itself:

```
POST /api/auth/email-otp/send-verification-otp
  → proxy: session exists + emailVerified: false + path ≠ /signup
  → redirect to /signup/learner  ← OTP request killed
```

**Fix** — also allow `/api/auth` through for unverified users in `proxy.ts`:

```ts
if (session && !session.user.emailVerified) {
  if (!pathname.startsWith("/signup") && !pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/signup/learner", request.url));
  }
  return NextResponse.next();
}
```

**Rule:** Any proxy check that restricts unverified users must also whitelist `/api/auth/*` — otherwise Better Auth's own endpoints get blocked.

---

## Final State

| File | Change |
|------|--------|
| `lib/auth/index.ts` | Added `await` to `resend.emails.send()`, removed `sendVerificationOnSignUp` and `overrideDefaultEmailVerification` |
| `app/(auth)/signup/learner/page.tsx` | Added manual `authClient.emailOtp.sendVerificationOtp()` call after signup |

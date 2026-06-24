# ADR 006 — OTP Verification on Signup Only

## Status
Accepted

## Context
The initial plan included an OTP verification screen after every login for both learners and mentors. As the auth flow was designed in detail, this was reconsidered.

## Decision
OTP verification happens once — at learner signup — to confirm the email address exists. It does not trigger on every login.

## Reasons
- Verifying on every login is redundant once the email is confirmed. Better Auth manages secure sessions via cookies after the first login — re-challenging the user adds friction with no security benefit.
- The standard practice is: verify the email once at signup, trust the session after that.
- Mentors are a special case: their first verified entry point is the magic link in the approval email (`mentor-approved.tsx`). That link acts as their initial verification. After that, normal email/password login applies.
- Re-verification on every login would be appropriate only for: password reset, suspicious logins (new device/country), or sensitive actions (changing email, withdrawing earnings) — none of which are in scope for the current phase.

## Consequences
- OTP screen (P2-04) is scoped to the learner signup flow only: signup form → OTP screen → onboarding
- Login page has no OTP step for either role
- If suspicious login detection is added in future, OTP can be re-introduced as a conditional challenge without changing the base login flow

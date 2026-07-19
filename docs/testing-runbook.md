# LIFFT — Calendar & Payments Testing Runbook

Work top to bottom. Each test says what to DO, what to WATCH, and what PASS
looks like. Stop and fix at the first failure — later tests assume earlier
ones pass. Expect round one to fail on configuration, not logic; that's the
point of running it.

---

## 0. One-time setup (30 min)

**Terminals (keep both running through everything):**
```bash
# Terminal 1
npm run dev

# Terminal 2 — prints a whsec_... on start
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
- [ ] Copy the printed secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`,
      restart dev server. (Wrong/stale whsec = every webhook 400s with
      "invalid signature".)
- [ ] `stripe config --list` — confirm the CLI is on the SAME sandbox as the
      `sk_test_` key in `.env.local`. Mismatch symptom: everything 200s,
      nothing appears in the dashboard.

**Test accounts (3 browser profiles or 2 browsers + incognito):**
- [ ] Mentor A — approved mentor, onboarding done, `hourly_rate_pence` set
- [ ] Learner L — verified learner
- [ ] A throwaway Google account for Mentor A (or your own — it will get
      real calendar events; a test Google account is cleaner)

**SQL scratchpad (Supabase SQL editor, re-run these constantly):**
```sql
-- sessions, newest first
select id, status, scheduled_at, expires_at, stripe_checkout_id, google_event_id
from mentor_sessions order by created_at desc limit 5;

-- slots
select id, status, slot_range from mentor_open_slots
order by created_at desc limit 10;

-- blockers
select google_event_id, blocker_range, lifft_session_id
from google_calendar_blockers order by updated_at desc limit 10;

-- integration state
select status, sync_token is not null as has_sync_token,
       channel_id, renew_at, updated_at
from calendar_integrations;

-- payments + webhook ledger
select * from payments order by created_at desc limit 5;
select id, type, received_at from stripe_events order by received_at desc limit 10;
```

---

## Part 1 — Google Calendar (do this first; booking depends on slots)

### 1.1 Connect
DO: As Mentor A → /calendar → Connect Google Calendar → consent with the
test Google account.
WATCH: redirected back to /calendar, no `?error=` param.
PASS:
- [ ] `calendar_integrations` row: status='active', access+refresh tokens
      present, `has_sync_token` true after first sync
- [ ] `channel_id`/`resource_id` set (localhost: watch registration FAILS —
      that's the expected try/catch path; channel columns stay null and you
      use the manual sync below. Fine.)

### 1.2 First sync
DO: If you built a manual sync trigger, hit it; otherwise call
`syncMentorCalendar` via a dev route. Have 2–3 events on the test Google
calendar first, within the next 60 days, including one all-day event and one
marked "Free".
PASS:
- [ ] Blockers table has the timed events with sane `[start,end)` ranges
- [ ] The "Free" event is ABSENT (transparency filter)
- [ ] All-day event spans local midnight–midnight (during BST its range
      starts at 23:00Z the previous day — that's correct, not a bug)
- [ ] /calendar page shows them under "Your busy times"

### 1.3 Publish slots
DO: On /calendar, publish: (a) a slot on free time tomorrow+, (b) a slot
overlapping a Google event, (c) a slot overlapping slot (a).
PASS:
- [ ] (a) succeeds → row status='open'
- [ ] (b) rejected: "clashes with your Google Calendar"
- [ ] (c) rejected: "already have a slot covering that time"
- [ ] A slot starting within min_notice_hours is rejected: "minimum notice"

### 1.4 Slot invalidation (the reconciliation loop)
DO: In Google Calendar, create an event overlapping open slot (a). Trigger
sync again (webhook won't fire on localhost — manual trigger).
PASS:
- [ ] Blocker row appears for the new event
- [ ] Slot (a) flips to status='withdrawn' automatically
- [ ] It vanishes from the learner's booking page
Then delete the Google event, sync again — blocker row deleted. (The slot
stays withdrawn; that's by design. Republish it for Part 2.)

### 1.5 Revocation loop
DO: In the test Google account → Security → Third-party access → remove
LIFFT. Trigger sync.
PASS:
- [ ] `calendar_integrations.status` = 'revoked'
- [ ] /calendar shows the reconnect banner
- [ ] Reconnect → status back to 'active', sync works again

---

## Part 2 — Stripe payments

### 2.1 Connect onboarding (Mentor A)
DO: Dashboard payout banner → Set up payouts → complete Stripe's hosted
flow with test values: any phone, OTP `000 000`, skip ID if offered,
bank sort code `10-88-00`, account `00012345`.
WATCH: Terminal 2 for `account.updated` events.
PASS:
- [ ] Redirected back to /dashboard?payouts=submitted, banner shows
      "verifying"
- [ ] Within ~a minute: `mentor_profiles.charges_enabled` = true, banner gone
- [ ] Stripe dashboard → Connected accounts shows the account, verified

Also test resume: start onboarding, close the tab halfway, click the button
again — Stripe resumes at the missing step, not from scratch.

### 2.2 The happy path (the big one)
DO: As Learner L → book Mentor A's open slot → Stripe Checkout →
card `4242 4242 4242 4242`, any future expiry, any CVC → pay.
WATCH: Terminal 2 (`checkout.session.completed` arriving), then the SQL
scratchpad.
PASS, in order:
- [ ] On clicking Book: session row created status='pending', slot 'held',
      expires_at ≈ now+35m, redirect to Stripe
- [ ] On paying: redirect back to /sessions/[id]?payment=success;
      "Confirming your payment…" resolves to Confirmed within seconds
- [ ] Session 'confirmed', expires_at null; slot 'booked'
- [ ] `payments` row: correct amount_pence, status='succeeded',
      payment_intent id set
- [ ] `stripe_events` has the completed event exactly once
- [ ] Google write-back: event on Mentor A's calendar, learner invited;
      `google_event_id` stored on the session; blocker echo appears with
      `lifft_session_id` set after next sync
- [ ] EM-04: both participants receive the confirmation email with .ics
      attached (check the Resend dashboard if inboxes are slow)
- [ ] Stripe dashboard: payment visible, destination = Mentor A's account,
      application fee = 15%

### 2.3 Double-booking race
DO: Open the same open slot as Learner L in two tabs. Book in tab 1 (just to
checkout, don't pay). Book in tab 2.
PASS:
- [ ] Tab 2 gets "That slot was just taken" (409), slot list refreshes
- [ ] Exactly ONE session row exists for the slot

### 2.4 Abandonment (checkout.session.expired)
DO: Book a slot, reach Stripe Checkout, close the tab. Don't wait 30 real
minutes — force it:
```bash
stripe trigger checkout.session.expired
```
…won't carry your metadata, so better: in Terminal 2's output find the
checkout session id from your abandoned booking, then expire it directly:
```bash
stripe checkout sessions expire cs_test_XXXX
```
WATCH: `checkout.session.expired` in Terminal 2.
PASS:
- [ ] Session → 'expired', slot → back to 'open', bookable again

### 2.5 The sweep (webhook-missed safety net)
DO: Book to checkout, close tab. This time KILL Terminal 2 (simulating
webhook outage), then in SQL: 
```sql
update mentor_sessions set expires_at = now() - interval '1 minute'
where status = 'pending';
select release_expired_holds();
```
PASS:
- [ ] Returns 1; session 'expired', slot 'open'
- [ ] Restart `stripe listen` afterwards

### 2.6 Declined card
DO: Book, pay with `4000 0000 0000 0002` (decline card).
PASS:
- [ ] Stripe shows the decline, learner stays on checkout, can retry with
      4242… — same session confirms normally. No duplicate session rows.

### 2.7 Idempotency
DO: In Terminal 2's output, find the completed event id. Resend it:
```bash
stripe events resend evt_XXXX
```
PASS:
- [ ] Webhook responds `{received: true, duplicate: true}`
- [ ] No second payments row, no second confirmation email

---

## Part 3 — Cron routes (10 min)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/calendar-maintenance
```
- [ ] 401 without the header; JSON summary with it
- [ ] Set a mentor's `renew_at` to the past first → response shows
      renewed:false + error on localhost (watch registration can't reach
      you) — the invalid_grant/error isolation is what you're verifying,
      plus `forceFullSync` running (blockers refreshed)
- [ ] Same drill for /api/cron/session-reminders with a confirmed session
      inside 26h → reminder emails arrive, `reminder_sent_at` stamped,
      second run sends nothing

---

## When something fails

1. Read the terminal error before changing anything.
2. Locate WHERE in the chain it broke: request → route → RPC → webhook →
   side-effect. The SQL scratchpad tells you the last state transition that
   succeeded.
3. Fix, re-run the SAME test, then continue.
4. Log every failure + cause in docs/testing-log.md — investors' technical
   diligence loves this artifact, and future-you loves it more.

Full pass of everything above = the session loop is soft-launch ready
end to end, minus video (Part 4 when P5 is wired).
# LIFFT Labs — Engineering Notes

Running log of technical decisions, edge cases, and architecture discussions.

---

## Product Pivot (2026-07-03)

After co-founder meeting, scope reduced to an MVP for early adopters.

**Dropped:**
- Cohorts, programs, group conversations
- Pathway browser, milestones, microlearning modules, portfolio
- Mentor marketplace / discovery
- AI matching algorithm
- Detailed learner UI and mentor UI

**Kept:**
- Full auth and onboarding loop
- Admin mentor approval flow

**New core loop:**
1. Learner signs up → onboards → linked to their mentor (manual for now)
2. Books a session from mentor's calendar
3. Pays
4. Video call
5. Chat between sessions

**Context:** 2 mentor co-founders with existing clients. No marketplace needed. Learners already know their mentor.

---

## Tech Decisions

### Video — Agora

**Decision:** Agora for video calls.

**Considered:**
- Whereby — browser only, no PSTN dial-in
- LiveKit — open source, EU region available, cleaner SDK
- Daily.co — EU data residency available
- Vonage Video — UK company, telephony + video
- Twilio Video — enterprise, expensive

**Why Agora:** reliable, generous free tier (10k minutes/month), React SDK, large community for debugging.

**Implementation note:** Agora token generation belongs in a single API route (`app/api/sessions/[id]/token/route.ts`), not a microservice. Token scoped to `channelName = sessionId`. Generate token when session page loads, not on button click, to avoid latency on join.

**Token edge case:** Agora tokens have a TTL. Generate with a 24hr TTL to cover the session. Don't single-use tokens — users may need to rejoin if they drop.

---

### Chat — Supabase Realtime

**Decision:** Supabase Realtime for chat.

**Considered:** Centrifugo

**Why not Centrifugo:** Purpose-built for high-frequency real-time at scale (millions of connections). For 1:1 mentor-learner conversations (low frequency, between sessions), it's over-engineering. Also requires self-hosting and manual message persistence — you'd still write to Postgres yourself.

**Why Supabase Realtime:** Already in stack. DB is source of truth, persistence is automatic. Handles the actual chat pattern: sparse 1:1 conversations with live notification of new rows.

**Revisit Centrifugo when:** 500+ concurrent mentor-learner pairs with high message frequency.

---

### Microservices — Decided Against (for now)

**Decision:** Monolith (Next.js) for MVP.

**Rationale:** Microservices solve scale problems that don't exist at 2 mentors + handful of clients. They add: networking overhead, inter-service auth, distributed tracing, deployment complexity, and split your debugging surface area — all from day one.

**Right architectural seam:** If video token generation needs to be isolated, move it to a Supabase Edge Function (runs at edge, independently deployable, low latency). That's a mini-service, not a full microservice split.

**When to extract a service:**
- 50+ concurrent video sessions
- Chat volume requiring a dedicated websocket cluster  
- Separate engineering team per service

---

### Rate Limiting — Upstash Redis

**Decision:** `@upstash/ratelimit` + Upstash Redis via Next.js middleware.

**Apply to:**
- `POST /api/auth/*` — brute force on login/signup
- `POST /api/sessions` — booking spam
- `POST /api/chat/messages` — message flooding

Free tier covers the entire MVP. Upstash uses a sliding window algorithm internally.

---

### UK Services

User is UK-based. Key requirement: GDPR compliance + data residency.

- **Supabase:** EU region available (`eu-west-2` London) — confirm project is in EU region
- **Vercel:** Edge network, GDPR compliant
- **Stripe:** UK business support, GBP native — set `currency: "gbp"` explicitly
- **Resend:** GDPR compliant
- **Agora:** Has EU data centres

**Note:** For phone dial-in (UK numbers), Agora doesn't cover this. Twilio or Vonage would be needed. For MVP, browser-only video is sufficient — skip phone dial-in until explicitly requested by users.

---

## Cybersecurity

### Already handled by stack
- HTTPS (Vercel)
- Auth sessions (Better Auth)
- Passwords hashed (Better Auth)
- DB access via service role only — API routes as trust boundary, no RLS exploit surface

### Must-do before real users
- Rate limit auth endpoints (Upstash)
- Stripe webhook signature verification — never skip this
- Never log PII (names, emails, health context) in Vercel logs

### Before charging money
- UK GDPR Privacy Policy + cookie notice (ICO requirement)
- Data Processing Agreement with Supabase (required for storing UK user data)
- Stripe PCI compliance — Stripe handles card data, verify nothing is logged on your side

### Healthcare-adjacent note
Not storing medical records so NHS DSP Toolkit doesn't apply. But mentees may share health history in chat — Privacy Policy must cover this. Don't store sensitive disclosures in plaintext logs.

### Ongoing
- `npm audit` periodically
- Rotate Supabase service role key if a co-founder leaves
- Keep Better Auth and Next.js updated (security patches)

---

## Edge Cases Catalogue

### Booking & Calendar

| Edge case | Risk | Fix |
|---|---|---|
| Two learners book same slot simultaneously | Double booking | Postgres row-level lock — check + insert in one transaction |
| Mentor blocks slot on Google Calendar after it appeared available | Booking a taken slot | Re-validate against Google Calendar at checkout, not just on page load |
| Timezone mismatch | Mentor/learner see different times | Store all times in UTC, display via `Intl.DateTimeFormat` in user's local timezone |
| UK BST/GMT switch (March + October) | Sessions shift by 1hr | UTC in DB solves this — never store local time |
| Mentor's Google OAuth token expires | Calendar sync silently breaks | Refresh token on every sync attempt, alert mentor if refresh fails |

### Payments

| Edge case | Risk | Fix |
|---|---|---|
| Stripe webhook fires twice | Session marked paid twice / duplicate row | Idempotency key on every Stripe call, dedupe on `stripe_event_id` in DB |
| Payment succeeds, webhook delayed | Session appears unpaid | Webhook is source of truth — don't mark paid until webhook fires |
| Payment succeeds, session creation fails | Money taken, no session | Wrap in transaction — rollback session row if anything fails, refund via Stripe API |
| Chargeback / dispute | Money clawed back | Store session metadata, join time, duration as Stripe dispute evidence |
| UK VAT | May need to charge VAT on platform fees | Consult accountant before launch — depends on revenue model |
| Currency default | Stripe defaults USD | Set `currency: "gbp"` explicitly on every Checkout session |

### Video (Agora)

| Edge case | Risk | Fix |
|---|---|---|
| Agora token expires mid-call | Call drops | Generate with 24hr TTL, or implement token renewal callback |
| User drops and tries to rejoin | Token rejected | Token must be reusable — don't invalidate on first use |
| User joins wrong session | Privacy breach | Token scoped to `channelName = sessionId`, never reuse channel names |
| Both users join before the other is ready | One-sided call confusion | Show "Waiting for [name]..." state until both present |

### Chat

| Edge case | Risk | Fix |
|---|---|---|
| Message sent while offline | Lost message | Show as "pending", retry on reconnect |
| Out-of-order message delivery | Scrambled conversation | Sort by `created_at` from DB, not arrival order |
| User opens chat on two devices | Duplicate read receipts | Use `read_at` timestamp per user, not per device |

### Auth

| Edge case | Risk | Fix |
|---|---|---|
| OTP expires before user enters it | User stuck | Resend button (already built), show expiry time |
| Session expires mid-booking | Loses booking state | Catch 401s, redirect with `?return=/sessions/book` |
| Mentor magic link used twice | Silent failure | Better Auth handles — ensure error message is clear |

---

## Data Structures in the Codebase

### Calendar slot availability — interval subtraction

The most algorithmically non-trivial problem. Finding available slots:

```
Mentor working hours: [09:00 ── 17:00]
Booked sessions:           [10:00─11:00]  [14:00─15:00]
Google Calendar busy:  [09:30─10:00]
Result (available):    [10:00─11:00]  [11:00─14:00]  [15:00─17:00]
```

Represent as sorted arrays of `{ start: Date, end: Date }`. Merge overlapping busy intervals, then subtract from working hours.

### Rate limiting — sliding window counter

Upstash implements this. Worth understanding: a ring buffer of timestamps per user key. Evict entries older than the window, count remaining. Set limit per window size.

### Chat pagination — keyset (cursor-based)

Don't use `OFFSET` for loading chat history — degrades as history grows. Use last message `id` or `created_at` as cursor:

```sql
SELECT * FROM messages
WHERE conversation_id = $1 AND created_at < $cursor
ORDER BY created_at DESC
LIMIT 20;
```

### Stripe idempotency — hash set

Table with unique index on `stripe_event_id`. Before processing any webhook, check if ID exists. Insert on process. Prevents double-processing without application-level locking.

---

## Dev Environment Transfer (New Machine)

To move the full setup to a new MacBook without losing memory:

1. **Codebase** — push to GitHub, clone on new machine (or AirDrop)
2. **Claude memory** — copy `~/.claude/` to same path on new machine. Memory is keyed to project path — if project lives at same path, it loads automatically
3. **Environment variables** — AirDrop `.env.local` (not in git)
4. **Install on new machine:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install --lts
   npm install -g @anthropic-ai/claude-code
   brew install supabase/tap/supabase
   npm install  # in project folder
   ```

---

## Pending Decisions

- **Mentor-learner linking:** how does a learner get assigned to their mentor? Options: admin SQL insert (fastest for MVP) or mentor invite link (right long-term answer)
- **Video provider final confirm:** Agora decided, but check EU data centre availability for UK GDPR
- **VAT:** consult accountant before first payment goes live
- **Phone dial-in:** deferred — revisit if mentors/learners request it

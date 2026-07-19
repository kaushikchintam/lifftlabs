-- ──────────────────────────────────────────────────────────
-- LIFFT — Reminder idempotency (P3-13 / EM-05)
-- reminder_sent_at is the check-and-set guard: the reminder cron only
-- selects sessions where it is NULL, and stamps it BEFORE sending, so
-- overlapping or re-run invocations can't double-send.
-- ──────────────────────────────────────────────────────────

ALTER TABLE mentor_sessions
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
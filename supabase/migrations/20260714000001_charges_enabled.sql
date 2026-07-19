-- ──────────────────────────────────────────────────────────
-- LIFFT — Mentor payment readiness (P4-01)
-- Maintained by the account.updated webhook. TRUE only when Stripe reports
-- both charges_enabled AND payouts_enabled on the Express account.
-- Booking is gated on this; slot publishing is not (mentors can prepare
-- their calendar while Stripe verifies).
-- ──────────────────────────────────────────────────────────

ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS charges_enabled boolean NOT NULL DEFAULT false;
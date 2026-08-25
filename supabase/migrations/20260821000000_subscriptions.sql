-- subscription_status is plain text, not an enum: the source of truth is
-- Stripe's own Subscription.status vocabulary (plus our synthetic
-- "canceling" pseudo-status for cancel_at_period_end), which Stripe can
-- extend over time — a hand-maintained enum here would just drift.
ALTER TABLE learner_profiles
    ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
    ADD COLUMN IF NOT EXISTS subscription_status text,
    ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

CREATE INDEX IF NOT EXISTS idx_learner_profiles_stripe_subscription_id
    ON learner_profiles (stripe_subscription_id);

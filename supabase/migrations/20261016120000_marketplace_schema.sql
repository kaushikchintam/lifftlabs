-- ──────────────────────────────────────────────────────────
-- Marketplace pivot: journeys → intake → match → pay per session.
-- Additive only, so the live pre-pivot app keeps working against it.
-- Legacy drops (learner tools, stages, calendar, subscription columns)
-- come in a later migration, once the pivot is deployed.
-- ──────────────────────────────────────────────────────────

-- 1. Mentor profile: what matching and match cards read.
--    Price reuses the existing hourly_rate_pence column (charged per
--    60-min session). charges_enabled already means charges AND payouts.
ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS headline    text,
  ADD COLUMN IF NOT EXISTS bio         text,
  ADD COLUMN IF NOT EXISTS credentials text,
  ADD COLUMN IF NOT EXISTS journeys    text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags        text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS kind        text    NOT NULL DEFAULT 'mentor',
  ADD COLUMN IF NOT EXISTS paused      boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_mentor_profiles_tags ON mentor_profiles USING gin (tags);

-- 2. Application: everything the "Become a LIFFT mentor" form collects,
--    plus the four vetting checks ({identity: {by, at}, ...}).
ALTER TABLE mentor_applications
  ADD COLUMN IF NOT EXISTS role_title       text,
  ADD COLUMN IF NOT EXISTS price_pence      int,
  ADD COLUMN IF NOT EXISTS journeys         text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags             text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS credentials      text,
  ADD COLUMN IF NOT EXISTS lived_experience text,
  ADD COLUMN IF NOT EXISTS checks           jsonb  NOT NULL DEFAULT '{}',
  -- set by the admin at approval; copied to mentor_profiles.kind at onboarding
  ADD COLUMN IF NOT EXISTS kind             text   NOT NULL DEFAULT 'mentor';

-- 3. Learner intake. Saved at booking (anonymous until then).
--    shared_keys = question ids the learner lets mentors see.
CREATE TABLE IF NOT EXISTS intakes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id  text        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  journey     text        NOT NULL,
  answers     jsonb       NOT NULL DEFAULT '{}',
  tags        text[]      NOT NULL DEFAULT '{}',
  shared_keys text[]      NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_intakes_learner ON intakes(learner_id);
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

-- 4. Session money + lineage. Destination charges: Stripe transfers
--    mentor_share_pence to the mentor at payment; LIFFT keeps fee_pence.
ALTER TABLE mentor_sessions
  ADD COLUMN IF NOT EXISTS journey                  text,
  ADD COLUMN IF NOT EXISTS intake_id                uuid REFERENCES intakes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS amount_pence             int,
  ADD COLUMN IF NOT EXISTS fee_pence                int,
  ADD COLUMN IF NOT EXISTS mentor_share_pence       int,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id       text,
  ADD COLUMN IF NOT EXISTS transferred_at           timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at              timestamptz,
  ADD COLUMN IF NOT EXISTS previous_session_id      uuid REFERENCES mentor_sessions(id) ON DELETE SET NULL;

-- Webhook, refunds and admin stats look sessions up by payment intent;
-- unique so one payment can never confirm two sessions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentor_sessions_payment_intent
  ON mentor_sessions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- 5. Waitlist for journeys with no live mentor.
CREATE TABLE IF NOT EXISTS waitlist (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  journey     text        NOT NULL,
  answers     jsonb       NOT NULL DEFAULT '{}',
  notified_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, journey)
);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 6. Top of the funnel (anonymous). Paid/completed/rebooked come from
--    mentor_sessions, so only these three steps are logged.
CREATE TABLE IF NOT EXISTS funnel_events (
  id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  journey    text        NOT NULL,
  step       text        NOT NULL CHECK (step IN ('chose_journey', 'intake', 'match_shown')),
  anon_id    text,
  user_id    text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_funnel_events_journey_step ON funnel_events(journey, step);
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- 7. Per-person archive in Messages.
ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- 8. Weekly hours: whole hours, end after start, no overlaps per day.
ALTER TABLE mentor_availability
  DROP CONSTRAINT IF EXISTS availability_whole_hours,
  DROP CONSTRAINT IF EXISTS availability_end_after_start,
  DROP CONSTRAINT IF EXISTS availability_no_overlap,
  ADD CONSTRAINT availability_whole_hours
    CHECK (date_part('minute', start_time) = 0 AND date_part('minute', end_time) = 0),
  ADD CONSTRAINT availability_end_after_start
    CHECK (end_time > start_time),
  ADD CONSTRAINT availability_no_overlap
    EXCLUDE USING gist (
      mentor_id WITH =,
      day_of_week WITH =,
      int4range(date_part('hour', start_time)::int, date_part('hour', end_time)::int) WITH &&
    );

-- 9. Slots from weekly hours. Rebuilds the mentor's OPEN future slots for
--    the next 14 days (UK time); held/booked slots are never touched, and
--    new slots skip anything overlapping them. Called on every hours edit
--    and nightly to roll the window forward.
CREATE OR REPLACE FUNCTION regenerate_open_slots(p_mentor_id text)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('slots:' || p_mentor_id));

  DELETE FROM mentor_open_slots
   WHERE mentor_id = p_mentor_id
     AND status IN ('open', 'withdrawn')
     AND lower(slot_range) > now();

  INSERT INTO mentor_open_slots (mentor_id, slot_range)
  SELECT p_mentor_id, tstzrange(s, s + interval '1 hour')
    FROM mentor_availability a
   CROSS JOIN generate_series(
           (now() AT TIME ZONE 'Europe/London')::date,
           (now() AT TIME ZONE 'Europe/London')::date + 13,
           interval '1 day') d
   CROSS JOIN LATERAL generate_series(
           (d::date + a.start_time) AT TIME ZONE 'Europe/London',
           (d::date + a.end_time)   AT TIME ZONE 'Europe/London' - interval '1 hour',
           interval '1 hour') s
   WHERE a.mentor_id = p_mentor_id
     AND extract(dow FROM d) = a.day_of_week
     AND s > now()
     AND NOT EXISTS (
       SELECT 1 FROM mentor_open_slots o
        WHERE o.mentor_id = p_mentor_id
          AND o.status IN ('open', 'held', 'booked')
          AND o.slot_range && tstzrange(s, s + interval '1 hour'));

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION regenerate_all_open_slots()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT DISTINCT mentor_id FROM mentor_availability LOOP
    PERFORM regenerate_open_slots(r.mentor_id);
  END LOOP;
END $$;

-- SECURITY DEFINER in public is callable by anon/authenticated through the
-- REST API by default. Only the service role (API routes) and cron may run these.
REVOKE EXECUTE ON FUNCTION regenerate_open_slots(text), regenerate_all_open_slots()
  FROM public, anon, authenticated;

SELECT cron.schedule('regenerate-open-slots', '5 0 * * *', $$ SELECT regenerate_all_open_slots(); $$);

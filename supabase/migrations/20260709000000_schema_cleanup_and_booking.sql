-- ──────────────────────────────────────────────────────────
-- LIFFT — Identity repair + booking schema (merged)
-- Base: Restored: slot state machine, slot
-- exclusion constraint, full RPC set, 35-min hold, RLS enables.
-- ──────────────────────────────────────────────────────────

-- Needed for exclusion constraints mixing = (text) with && (range)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ──────────────────────────────────────────────────────────
-- 1. Add expired to session_status enum
--    pending = payment not yet taken
-- ──────────────────────────────────────────────────────────
ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'expired';

-- ──────────────────────────────────────────────────────────
-- 2. mentor_sessions
--    Drop exclusion constraint + FKs → retype → re-add
--    New WHERE clause: cancelled/completed/expired slots are free again
--    NOTE: if any ALTER COLUMN TYPE below fails with "used in foreign key",
--    a legacy FK has a different name — check with \d mentor_sessions.
-- ──────────────────────────────────────────────────────────
ALTER TABLE mentor_sessions DROP CONSTRAINT IF EXISTS no_overlapping_sessions;
DROP INDEX IF EXISTS idx_mentor_sessions_range;
ALTER TABLE mentor_sessions DROP CONSTRAINT IF EXISTS mentor_sessions_mentor_id_fkey;
ALTER TABLE mentor_sessions DROP CONSTRAINT IF EXISTS mentor_sessions_learner_id_fkey;

ALTER TABLE mentor_sessions ALTER COLUMN mentor_id TYPE text;
ALTER TABLE mentor_sessions ALTER COLUMN learner_id TYPE text;

ALTER TABLE mentor_sessions
  ADD CONSTRAINT mentor_sessions_mentor_id_fkey
  FOREIGN KEY (mentor_id) REFERENCES "user"(id) ON DELETE RESTRICT;

ALTER TABLE mentor_sessions
  ADD CONSTRAINT mentor_sessions_learner_id_fkey
  FOREIGN KEY (learner_id) REFERENCES "user"(id) ON DELETE RESTRICT;

CREATE INDEX idx_mentor_sessions_range
  ON mentor_sessions USING gist (booking_range);

ALTER TABLE mentor_sessions
  ADD CONSTRAINT no_overlapping_sessions
  EXCLUDE USING gist (mentor_id WITH =, booking_range WITH &&)
  WHERE (status IN ('pending', 'confirmed'));

-- ──────────────────────────────────────────────────────────
-- 3. payments — retype user_id, re-add FK
-- ──────────────────────────────────────────────────────────
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE payments ALTER COLUMN user_id TYPE text;
ALTER TABLE payments
  ADD CONSTRAINT payments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE RESTRICT;

-- ──────────────────────────────────────────────────────────
-- 4. conversation_participants — retype user_id, re-add FK + PK
-- ──────────────────────────────────────────────────────────
ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;
ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_pkey;
ALTER TABLE conversation_participants ALTER COLUMN user_id TYPE text;
ALTER TABLE conversation_participants ADD PRIMARY KEY (conversation_id, user_id);
ALTER TABLE conversation_participants
  ADD CONSTRAINT conversation_participants_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────
-- 5. messages — drop Realtime-contaminated table, recreate clean
--    Index: DESC + id tiebreaker for keyset pagination (P6-04)
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       text        NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  content         text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  read_at         timestamptz
);
CREATE INDEX idx_messages_conversation_cursor
  ON messages (conversation_id, created_at DESC, id DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────
-- 6. mentor_applications — drop FK to profiles, retype reviewed_by
-- ──────────────────────────────────────────────────────────
ALTER TABLE mentor_applications DROP CONSTRAINT IF EXISTS mentor_applications_reviewed_by_fkey;
ALTER TABLE mentor_applications ALTER COLUMN reviewed_by TYPE text USING reviewed_by::text;

-- ──────────────────────────────────────────────────────────
-- 7. learner_profiles — redistribute columns from profiles, add FK
-- ──────────────────────────────────────────────────────────
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS linkedin_url       text;
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE learner_profiles
  ADD CONSTRAINT learner_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────
-- 8. mentor_profiles — add FK to "user"
-- ──────────────────────────────────────────────────────────
ALTER TABLE mentor_profiles
  ADD CONSTRAINT mentor_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────
-- 9. Calendar tables — add FKs to "user"
-- ──────────────────────────────────────────────────────────
ALTER TABLE calendar_integrations
  ADD CONSTRAINT calendar_integrations_mentor_id_fkey
  FOREIGN KEY (mentor_id) REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE google_calendar_blockers
  ADD CONSTRAINT google_calendar_blockers_mentor_id_fkey
  FOREIGN KEY (mentor_id) REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE mentor_availability
  ADD CONSTRAINT mentor_availability_mentor_id_fkey
  FOREIGN KEY (mentor_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────
-- 10. Drop profiles + auto-create trigger + orphaned enum
-- ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_role;

-- ──────────────────────────────────────────────────────────
-- 11. New columns on existing tables
-- ──────────────────────────────────────────────────────────

-- Google Calendar integration connection state
ALTER TABLE calendar_integrations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'revoked'));

-- Link a blocker back to the session that created it (write-back echo)
ALTER TABLE google_calendar_blockers
  ADD COLUMN IF NOT EXISTS lifft_session_id uuid
  REFERENCES mentor_sessions(id) ON DELETE SET NULL;

-- Booking flow columns on mentor_sessions
ALTER TABLE mentor_sessions ADD COLUMN IF NOT EXISTS google_event_id    text;
ALTER TABLE mentor_sessions ADD COLUMN IF NOT EXISTS slot_id            uuid;
ALTER TABLE mentor_sessions ADD COLUMN IF NOT EXISTS stripe_checkout_id text;
ALTER TABLE mentor_sessions ADD COLUMN IF NOT EXISTS expires_at         timestamptz;

-- ──────────────────────────────────────────────────────────
-- 12. mentor_open_slots — mentor-published bookable slots
--     status, not boolean: the booking flow needs four states —
--       open      → bookable
--       held      → payment in flight (release if abandoned)
--       booked    → paid (never auto-release)
--       withdrawn → sync found a Google Calendar conflict
--     slot_range as tstzrange: enables the no-overlap exclusion
--     constraint and && queries in reconciliation.
-- ──────────────────────────────────────────────────────────
CREATE TABLE mentor_open_slots (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   text        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  slot_range  tstzrange   NOT NULL,
  status      text        NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'held', 'booked', 'withdrawn')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT slot_not_empty CHECK (NOT isempty(slot_range)),
  CONSTRAINT no_overlapping_active_slots
    EXCLUDE USING gist (mentor_id WITH =, slot_range WITH &&)
    WHERE (status IN ('open', 'held', 'booked'))
);

CREATE INDEX idx_mentor_open_slots_mentor
  ON mentor_open_slots(mentor_id);

ALTER TABLE mentor_open_slots ENABLE ROW LEVEL SECURITY;

-- Now safe to add the FK from mentor_sessions.slot_id
ALTER TABLE mentor_sessions
  ADD CONSTRAINT mentor_sessions_slot_id_fkey
  FOREIGN KEY (slot_id) REFERENCES mentor_open_slots(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────────────────
-- 13. stripe_events — idempotency table for webhook processing
--     (column names match the webhook handler: id, type)
-- ──────────────────────────────────────────────────────────
CREATE TABLE stripe_events (
  id          text        PRIMARY KEY,
  type        text        NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────
-- 14. Sync RPCs — atomic blocker writes + slot reconciliation.
--     Advisory xact lock serialises concurrent syncs per mentor
--     (Google webhook pings arrive in bursts).
--     SECURITY DEFINER: called only via service role from API routes.
-- ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reconcile_open_slots(p_mentor_id text)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer;
BEGIN
  UPDATE mentor_open_slots s
     SET status = 'withdrawn', updated_at = now()
   WHERE s.mentor_id = p_mentor_id
     AND s.status = 'open'
     AND EXISTS (
       SELECT 1 FROM google_calendar_blockers b
        WHERE b.mentor_id = p_mentor_id
          AND b.lifft_session_id IS NULL     -- ignore our own write-back echoes
          AND b.blocker_range && s.slot_range
     );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION replace_mentor_blockers(
  p_mentor_id text,
  p_blockers  jsonb
)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('calendar_sync:' || p_mentor_id));

  DELETE FROM google_calendar_blockers WHERE mentor_id = p_mentor_id;

  INSERT INTO google_calendar_blockers
    (mentor_id, google_event_id, blocker_range, lifft_session_id, updated_at)
  SELECT p_mentor_id, b.google_event_id, b.blocker_range::tstzrange,
         b.lifft_session_id, now()
    FROM jsonb_to_recordset(p_blockers)
      AS b(google_event_id text, blocker_range text, lifft_session_id uuid);

  RETURN reconcile_open_slots(p_mentor_id);
END $$;

CREATE OR REPLACE FUNCTION apply_blocker_delta(
  p_mentor_id  text,
  p_upserts    jsonb,
  p_delete_ids text[]
)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('calendar_sync:' || p_mentor_id));

  IF array_length(p_delete_ids, 1) IS NOT NULL THEN
    DELETE FROM google_calendar_blockers
     WHERE mentor_id = p_mentor_id
       AND google_event_id = ANY (p_delete_ids);
  END IF;

  INSERT INTO google_calendar_blockers
    (mentor_id, google_event_id, blocker_range, lifft_session_id, updated_at)
  SELECT p_mentor_id, b.google_event_id, b.blocker_range::tstzrange,
         b.lifft_session_id, now()
    FROM jsonb_to_recordset(p_upserts)
      AS b(google_event_id text, blocker_range text, lifft_session_id uuid)
  ON CONFLICT (mentor_id, google_event_id)
  DO UPDATE SET blocker_range    = EXCLUDED.blocker_range,
                lifft_session_id = EXCLUDED.lifft_session_id,
                updated_at       = now();

  RETURN reconcile_open_slots(p_mentor_id);
END $$;

-- ──────────────────────────────────────────────────────────
-- 15. Booking RPCs — the hold → confirm/release state machine.
--
--     hold_slot: times derive FROM THE SLOT ROW, never from the
--     caller — client-supplied times would let a tampered request
--     hold slot A but book time B.
--     35-minute hold: Stripe Checkout's expires_at has a hard
--     30-minute MINIMUM. A shorter hold releases the slot while
--     the learner's checkout page is still live and payable.
--     booking_range is GENERATED from (scheduled_at, ends_at);
--     the exclusion constraint backstops any race.
-- ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION hold_slot(
  p_slot_id      uuid,
  p_learner_id   text,
  p_hold_minutes integer DEFAULT 35
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_slot       mentor_open_slots%ROWTYPE;
  v_session_id uuid;
BEGIN
  SELECT * INTO v_slot
    FROM mentor_open_slots
   WHERE id = p_slot_id
   FOR UPDATE;                       -- concurrent holds queue here

  IF NOT FOUND OR v_slot.status <> 'open'
     OR lower(v_slot.slot_range) < now() THEN
    RAISE EXCEPTION 'slot_unavailable';
  END IF;

  UPDATE mentor_open_slots
     SET status = 'held', updated_at = now()
   WHERE id = p_slot_id;

  INSERT INTO mentor_sessions (
    mentor_id, learner_id, slot_id,
    scheduled_at, ends_at,
    duration_minutes, status, expires_at
  ) VALUES (
    v_slot.mentor_id, p_learner_id, p_slot_id,
    lower(v_slot.slot_range), upper(v_slot.slot_range),
    ceil(extract(epoch FROM (upper(v_slot.slot_range) - lower(v_slot.slot_range))) / 60),
    'pending', now() + make_interval(mins => p_hold_minutes)
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END $$;

-- checkout.session.completed → confirm. Idempotent: returns false
-- if the session isn't in a confirmable state.
CREATE OR REPLACE FUNCTION confirm_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slot_id uuid;
BEGIN
  UPDATE mentor_sessions
     SET status = 'confirmed', expires_at = NULL
   WHERE id = p_session_id
     AND status = 'pending'
  RETURNING slot_id INTO v_slot_id;

  IF NOT FOUND THEN RETURN false; END IF;

  UPDATE mentor_open_slots
     SET status = 'booked', updated_at = now()
   WHERE id = v_slot_id;

  RETURN true;
END $$;

-- checkout.session.expired (or sweep) → release the hold.
-- Only flips slots that are still 'held' — never touches 'booked'.
CREATE OR REPLACE FUNCTION release_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slot_id uuid;
BEGIN
  UPDATE mentor_sessions
     SET status = 'expired'
   WHERE id = p_session_id
     AND status = 'pending'
  RETURNING slot_id INTO v_slot_id;

  IF NOT FOUND THEN RETURN false; END IF;

  UPDATE mentor_open_slots
     SET status = 'open', updated_at = now()
   WHERE id = v_slot_id
     AND status = 'held';

  RETURN true;
END $$;

-- Safety-net sweep for holds whose checkout.session.expired never
-- arrived (crash mid-checkout, webhook outage). Schedule ~every 10 min.
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count integer := 0;
  r record;
BEGIN
  FOR r IN
    SELECT id FROM mentor_sessions
     WHERE status = 'pending' AND expires_at < now()
  LOOP
    PERFORM release_session(r.id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;
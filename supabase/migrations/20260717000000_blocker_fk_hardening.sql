-- 20260717000000_blocker_fk_hardening.sql
-- A synced event may carry a lifft_session_id for a session that no longer
-- exists (test cleanup, event duplication). Null the tag instead of failing
-- the whole atomic sync on the FK.

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
         ms.id,                     -- resolves to NULL when the session is gone
         now()
    FROM jsonb_to_recordset(p_blockers)
      AS b(google_event_id text, blocker_range text, lifft_session_id uuid)
    LEFT JOIN mentor_sessions ms ON ms.id = b.lifft_session_id;

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
         ms.id, now()
    FROM jsonb_to_recordset(p_upserts)
      AS b(google_event_id text, blocker_range text, lifft_session_id uuid)
    LEFT JOIN mentor_sessions ms ON ms.id = b.lifft_session_id
  ON CONFLICT (mentor_id, google_event_id)
  DO UPDATE SET blocker_range    = EXCLUDED.blocker_range,
                lifft_session_id = EXCLUDED.lifft_session_id,
                updated_at       = now();

  RETURN reconcile_open_slots(p_mentor_id);
END $$;
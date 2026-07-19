-- ──────────────────────────────────────────────────────────
-- LIFFT — Chat support (Phase 6)
-- ──────────────────────────────────────────────────────────

-- P6-05 leading-edge debounce: first message of a burst emails immediately,
-- subsequent messages within the window are suppressed.
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS last_notified_at timestamptz;

-- ──────────────────────────────────────────────────────────
-- P6-03: one conversation per (mentor, learner) pair.
-- The pair lives in conversation_participants (two rows), so uniqueness
-- can't be a table constraint — enforce it here with an advisory lock on
-- the SORTED pair, making concurrent booking calls serialize and converge
-- on the same conversation. Idempotent by construction.
-- ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user_a text,
  p_user_b text
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_first  text := least(p_user_a, p_user_b);
  v_second text := greatest(p_user_a, p_user_b);
  v_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('conversation:' || v_first || ':' || v_second));

  -- Existing 1:1 conversation containing exactly these two participants
  SELECT cp1.conversation_id INTO v_id
    FROM conversation_participants cp1
    JOIN conversation_participants cp2
      ON cp2.conversation_id = cp1.conversation_id
   WHERE cp1.user_id = v_first
     AND cp2.user_id = v_second
   LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  INSERT INTO conversations DEFAULT VALUES RETURNING id INTO v_id;
  INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES (v_id, v_first), (v_id, v_second);

  RETURN v_id;
END $$;
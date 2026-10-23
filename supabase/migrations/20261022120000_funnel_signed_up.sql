-- Signup-first flow: intake → account → dashboard. match_shown stays valid for old rows.
ALTER TABLE funnel_events
  DROP CONSTRAINT IF EXISTS funnel_events_step_check,
  ADD CONSTRAINT funnel_events_step_check
    CHECK (step IN ('chose_journey', 'intake', 'match_shown', 'signed_up'));

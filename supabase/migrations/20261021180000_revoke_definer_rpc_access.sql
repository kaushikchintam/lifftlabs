-- ──────────────────────────────────────────────────────────
-- SECURITY DEFINER functions in public are executable by anon and
-- authenticated through the REST API by default — e.g. anyone with the
-- publishable key could call confirm_session and confirm a booking without
-- paying. All app access goes through the service role (ADR 008/010), so
-- only service_role (and pg_cron, which runs as the owner) keeps EXECUTE.
-- ──────────────────────────────────────────────────────────
DO $$
DECLARE f regprocedure;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN (
         'hold_slot', 'confirm_session', 'release_session', 'release_expired_holds',
         'reconcile_open_slots', 'replace_mentor_blockers', 'apply_blocker_delta',
         'get_or_create_conversation'
       )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM public, anon, authenticated', f);
  END LOOP;
END $$;

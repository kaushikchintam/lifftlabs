--enables pg_cron and schedules release_expired_holds() every 10 minutes, 
--entirely inside Postgres.
-- ──────────────────────────────────────────────────────────
-- LIFFT — Hold sweep on pg_cron
-- Releases pending sessions whose payment hold expired but whose
-- checkout.session.expired webhook never arrived (crash mid-checkout,
-- webhook outage). Belt-and-braces behind the Stripe webhook.
--
-- pg_cron is available on Supabase: Dashboard → Database → Extensions,
-- or via this migration. Jobs run inside the database — no HTTP, no
-- external scheduler.
-- ──────────────────────────────────────────────────────────

-- Every 10 minutes. Idempotent: release_session only touches sessions
-- still in 'pending' and slots still in 'held'.
SELECT cron.schedule(
    'release-expired-holds', -- job name (unique; reschedule replaces)
    '*/10 * * * *',
    $$ SELECT release_expired_holds(); $$
);

-- To inspect:  SELECT * FROM cron.job;
--              SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- To remove:   SELECT cron.unschedule('release-expired-holds');
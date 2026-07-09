--Enable btree_gist for overlap exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Drop FK columns first
ALTER TABLE mentor_sessions DROP COLUMN IF EXISTS cohort_id;
ALTER TABLE payments DROP COLUMN IF EXISTS program_id;

-- Drop tables (child -> parent order)
DROP TABLE IF EXISTS portfolio_items;
DROP TABLE IF EXISTS milestone_completions;
DROP TABLE IF EXISTS user_pathway_progress;
DROP TABLE IF EXISTS cohort_members;
DROP TABLE IF EXISTS cohorts;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS microlearning_modules;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS pathways;

--Drop enums (now unreferenced)
DROP TYPE IF EXISTS milestone_type;
DROP TYPE IF EXISTS content_type;
DROP TYPE IF EXISTS cohort_status;
DROP TYPE IF EXISTS member_status;
DROP TYPE IF EXISTS progress_status;
DROP TYPE IF EXISTS portfolio_item_type;

--UPDATE mentor_sessions
ALTER TABLE mentor_sessions
  ADD COLUMN ends_at  timestamptz,
  ADD COLUMN timezone text NOT NULL DEFAULT 'Europe/London';

--Generated range column - powers double-booking prevention at DB layer
ALTER TABLE mentor_sessions
  ADD COLUMN booking_range tstzrange
    GENERATED ALWAYS AS (tstzrange(scheduled_at, ends_at)) STORED;

CREATE INDEX idx_mentor_sessions_range
  ON mentor_sessions USING gist (booking_range);

--Exclusion constraint: same mentor cannot have overlapping sessions
ALTER TABLE mentor_sessions
 ADD CONSTRAINT no_overlapping_sessions
   EXCLUDE USING gist (mentor_id WITH =, booking_range WITH &&);

--GOOGLE OAuth tokens per mentor
CREATE TABLE calendar_integrations (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id        text        NOT NULL, 
    provider         text        NOT NULL DEFAULT 'google',
    access_token     text        NOT NULL,
    refresh_token    text        NOT NULL,
    token_expiry     timestamptz        NOT NULL, 
    calendar_id      text, 
    channel_id       text,           -- Google webhook channel ID
    resource_id      text,           -- Google webhook resource ID
    channel_expiry   timestamptz,           -- Google's hard expiry date
    renew_at         timestamptz,           -- Renew at 50% of channel lifetime
    sync_token       text,                  -- Google incremental sync token
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now(),
    UNIQUE  (mentor_id, provider)
);

CREATE INDEX idx_calendar_integrations_mentor
  ON calendar_integrations(mentor_id);

--Mentor weekly availability template
CREATE TABLE mentor_availability (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id    text NOT NULL, 
    day_of_week  int  NOT NULL CHECK (day_of_week BETWEEN 0 and 6), -- 0=Sun, 6=Sat
    start_time   time NOT NULL,   --eg. 09:00
    end_time     time NOT NULL,   --eg. 17:00
    timezone     text NOT NULL DEFAULT 'Europe/London',
    created_at   timestamptz DEFAULT now(), 
    UNIQUE (mentor_id, day_of_week, start_time) 
);

CREATE INDEX idx_mentor_availability_mentor
  ON mentor_availability(mentor_id);

--Cached Google calendar busy blocks (30-day rolling window)
CREATE TABLE google_calendar_blockers (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id       text        NOT NULL, 
    google_event_id text        NOT NULL, 
    blocker_range   tstzrange   NOT NULL, 
    updated_at      timestamptz DEFAULT now(),
    UNIQUE (mentor_id, google_event_id)
);

CREATE INDEX idx_google_blockers_range
  ON google_calendar_blockers USING gist (blocker_range);

CREATE INDEX idx_google_blockers_mentor
  ON google_calendar_blockers(mentor_id);
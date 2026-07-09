ALTER TABLE mentor_profiles
  ADD COLUMN buffer_minutes            int NOT NULL DEFAULT 15, 
  ADD COLUMN min_notice_hours          int NOT NULL DEFAULT 24, 
  ADD COLUMN max_sessions_per_day      int, 
  ADD COLUMN max_sessions_per_week     int;
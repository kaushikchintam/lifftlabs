-- Applicant tools are back for the medical-school journey.
-- Portfolio: four applicant areas ('leadership' already exists) + a UCAS choice tracker.
ALTER TYPE portfolio_category ADD VALUE IF NOT EXISTS 'work_experience';
ALTER TYPE portfolio_category ADD VALUE IF NOT EXISTS 'volunteering_caring';
ALTER TYPE portfolio_category ADD VALUE IF NOT EXISTS 'academic';

CREATE TABLE IF NOT EXISTS med_school_applications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  school     text        NOT NULL CHECK (char_length(school) BETWEEN 1 AND 120),
  stage      text        NOT NULL DEFAULT 'considering'
             CHECK (stage IN ('considering', 'applied', 'interview', 'offer', 'unsuccessful')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, school)
);
ALTER TABLE med_school_applications ENABLE ROW LEVEL SECURITY;

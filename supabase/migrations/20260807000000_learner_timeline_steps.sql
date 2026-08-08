--enum
create type timeline_step_status as enum ('todo', 'in_progress', 'done');

CREATE TABLE learner_timeline_steps (
    --Unique Identifier
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title text not null,
    due_date date,
    status timeline_step_status not null default 'todo',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE INDEX idx_learner_timeline_steps_user ON learner_timeline_steps (user_id);



CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN 
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timeline_step_modtime
    BEFORE UPDATE ON learner_timeline_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
CREATE TABLE gibbs_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    session_id UUID REFERENCES "mentor_sessions"(id) on delete set null, 
    title text, 
    description text default null, 
    feelings text default null, 
    evaluation text default null, 
    analysis text default null, 
    conclusion text default null, 
    action_plan text default null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE INDEX idx_gibbs_reflections_user_id ON gibbs_reflections (user_id);
CREATE INDEX idx_gibbs_reflections_session_id ON gibbs_reflections (session_id);

CREATE TRIGGER update_gibbs_reflections_modtime
    BEFORE UPDATE ON gibbs_reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
--enum
create type checklist_step_status as enum ('todo', 'in_progress', 'done');

CREATE TABLE checklist_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, 
    title text not null, 
    created_at timestamptz default now(),
    updated_at timestamptz default now() 
);

CREATE TABLE checklist_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
    section_id uuid NOT NULL REFERENCES "checklist_sections"(id) ON DELETE CASCADE, 
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, 
    title text not null, 
    status checklist_step_status not null default 'todo',
    created_at timestamptz default now(), 
    updated_at timestamptz default now()
);

CREATE TABLE checklist_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
    step_id uuid NOT NULL REFERENCES "checklist_steps"(id) ON DELETE CASCADE, 
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content text NOT NULL, 
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE INDEX idx_checklist_sections_user ON checklist_sections (user_id);
CREATE INDEX idx_checklist_steps_user ON checklist_steps (user_id);
CREATE INDEX idx_checklist_notes_user_step ON checklist_notes (step_id, user_id);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN 
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_checklist_sections_modtime
    BEFORE UPDATE ON checklist_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_checklist_steps_modtime
    BEFORE UPDATE ON checklist_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();  

CREATE TRIGGER update_checklist_notes_modtime
    BEFORE UPDATE ON checklist_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();  
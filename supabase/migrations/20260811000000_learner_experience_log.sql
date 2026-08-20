--enum 
create type experience_kind as enum ('shadowing', 'volunteering', 'observation', 'paid_care_work', 'virtual_course', 'other');
create type experience_setting as enum ('remote', 'in_person');
create type experience_frequency_unit as enum ('week', 'fortnight', 'month');
create type attachment_kind as enum ('evidence', 'photo');

CREATE TABLE experience_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, 
    exp_type experience_kind not null,
    custom_exp_type text DEFAULT NULL, 
    activity_description text, 
    organisation text not null, 
    location_site text not null, 
    setting experience_setting default null, 
    duration_note text default null, 
    supervisor text default null, 
    evidence_reference text default null, 
    --recurring hours
    is_recurring boolean not null default false,
    start_date date not null,
    end_date date default null,
    hours_per_period int default null,
    frequency_unit experience_frequency_unit default null,
    head_start_hours int not null default 0, --the optional pre-existing-experience offset
    total_hours int default null, --the one-off hours
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    --Enforcing data integrity
    --If type is 'other', custom text must be filled. Otherwise it must be null.
    CONSTRAINT check_custom_type_filled CHECK(
        (exp_type = 'other' AND custom_exp_type is not null AND custom_exp_type <> '') OR
        (exp_type <> 'other' AND custom_exp_type is null)
        ),
    --Recurring rows fill the recurring fields and leave total_hours null;
    --one-off rows fill total_hours and leave the recurring fields null.
    CONSTRAINT check_recurring_fields CHECK(
        (is_recurring = true AND hours_per_period is not null AND frequency_unit is not null AND total_hours is null) OR
        (is_recurring = false AND total_hours is not null AND hours_per_period is null AND frequency_unit is null)
        )
);

CREATE TABLE experience_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id uuid NOT NULL REFERENCES "experience_log"(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    kind attachment_kind not null,
    storage_path text not null,
    file_name text not null,
    mime_type varchar(255) not null,
    size_bytes bigint not null,
    created_at timestamptz default now()
);

CREATE INDEX idx_experience_log_user_id ON experience_log (user_id);
CREATE INDEX idx_experience_attachments_user_id ON experience_attachments (user_id);
CREATE INDEX idx_experience_attachments_experience_id ON experience_attachments (experience_id);
  
CREATE VIEW experience_log_with_hours AS 
  SELECT
    experience_log.id,
    experience_log.user_id, 
    experience_log.exp_type, 
    experience_log.custom_exp_type, 
    experience_log.activity_description, 
    experience_log.organisation, 
    experience_log.location_site, 
    experience_log.setting, 
    experience_log.duration_note, 
    experience_log.supervisor, 
    experience_log.evidence_reference,
    experience_log.is_recurring, 
    experience_log.start_date, 
    experience_log.end_date, 
    experience_log.hours_per_period, 
    experience_log.frequency_unit, 
    experience_log.head_start_hours, 
    experience_log.total_hours, 
    experience_log.created_at,
    experience_log.updated_at,
    CASE
        WHEN is_recurring = FALSE THEN total_hours
        WHEN is_recurring = TRUE AND end_date IS NULL THEN
            CASE frequency_unit
                WHEN 'week' THEN FLOOR((CURRENT_DATE - start_date) / 7)
                WHEN 'fortnight' THEN FLOOR((CURRENT_DATE - start_date) / 14)
                WHEN 'month' THEN EXTRACT(YEAR FROM age(CURRENT_DATE, start_date))::int * 12
                    + EXTRACT(MONTH FROM age(CURRENT_DATE, start_date))::int
            END * hours_per_period + head_start_hours
        WHEN is_recurring = TRUE AND end_date IS NOT NULL THEN
            CASE frequency_unit
                WHEN 'week' THEN FLOOR((end_date - start_date) / 7)
                WHEN 'fortnight' THEN FLOOR((end_date - start_date) / 14)
                WHEN 'month' THEN EXTRACT(YEAR FROM age(end_date, start_date))::int * 12
                    + EXTRACT(MONTH FROM age(end_date, start_date))::int
            END * hours_per_period + head_start_hours
        ELSE 0
    END AS live_hours
   FROM 
       experience_log;  

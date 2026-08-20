create type specialty_application_status as enum ('portfolio_building', 'application_submitted', 'interview_invited', 'ranked_offer');

CREATE TABLE specialty_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE, 
    specialty text not null, 
    status specialty_application_status not null default 'portfolio_building',
    target_year int default null, 
    notes text default null, 
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_specialty_applications_user_id on specialty_applications (user_id);

create trigger update_specialty_applications_modtime
    before update on specialty_applications
    for each row
    execute function update_modified_column();
CREATE TABLE clinical_rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) on delete cascade, 
    specialty text not null, 
    start_date date not null, 
    end_date date default null, 
    is_genuine_interest boolean not null default false, 
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_clinical_rotations_user_id on clinical_rotations(user_id);

create trigger update_clinical_rotations_modtime
    before update on clinical_rotations
    for each row
    execute function update_modified_column();
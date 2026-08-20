CREATE TABLE resource_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE, 
    resource_slug text not null, 
    reflection text not null,
    engaged_at timestamptz default now(), 
    updated_at timestamptz default now()
);

create index idx_resource_reflections_user_id on resource_reflections (user_id);

create trigger update_resource_reflections_modtime
    before update on resource_reflections
    for each row
    execute function update_modified_column();
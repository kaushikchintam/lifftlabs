create type funding_scheme_status as enum ('not_checked', 'looks_eligible', 'applied', 'received');

CREATE TABLE funding_scheme_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE,
    scheme_slug text not null,
    status funding_scheme_status not null default 'not_checked',
    actual_amount_pence int default null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (user_id, scheme_slug)
);

create index idx_funding_scheme_progress_user_id on funding_scheme_progress (user_id);

create trigger update_funding_scheme_progress_modtime
    before update on funding_scheme_progress
    for each row
    execute function update_modified_column();

alter table funding_scheme_progress enable row level security;

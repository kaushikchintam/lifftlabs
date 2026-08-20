create type portfolio_category as enum ('research', 'teaching', 'leadership', 'commitment_to_specialty');

CREATE TABLE portfolio_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text not null REFERENCES "user"(id) on delete cascade,
    category portfolio_category not null,
    title text not null,
    type text not null,
    organisation text not null,
    linked_specialty text default null,
    start_date date not null,
    end_date date default null,
    reflection text not null,
    signed_off_at timestamptz default null,
    signed_off_by text references "user"(id),
    created_at timestamptz default now(), 
    updated_at timestamptz default now()
);

create index idx_portfolio_entries_user_id on portfolio_entries (user_id);

create trigger update_portfolio_entries_modtime
    before update on portfolio_entries
    for each row
    execute function update_modified_column();
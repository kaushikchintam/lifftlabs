create type finance_cadence as enum ('monthly', 'yearly');

CREATE TABLE finance_pot_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE,
    amount_pence int not null, 
    contributed_at timestamptz default now()
);

CREATE TABLE transition_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE, 
    label text not null, 
    amount_pence int not null, 
    is_paid boolean not null default false, 
    due_note text default null, 
    created_at timestamptz default now(), 
    updated_at timestamptz default now()
);

CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE, 
    label text not null, 
    amount_pence int not null, 
    cadence finance_cadence not null, 
    status_tag text default null, 
    description text default null, 
    created_at timestamptz default now(), 
    updated_at timestamptz default now()
);

CREATE TABLE outgoings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE, 
    label text not null, 
    amount_pence int not null, 
    cadence finance_cadence not null, 
    tag text default null, 
    description text default null, 
    created_at timestamptz default now(), 
    updated_at timestamptz default now()    
);

create index idx_finance_pot_contributions_user_id on finance_pot_contributions(user_id);
create index idx_transition_costs_user_id on transition_costs(user_id);
create index idx_income_sources_user_id on income_sources(user_id);
create index idx_outgoings_user_id on outgoings (user_id);

create trigger update_transition_costs_modtime before update on transition_costs for each row execute function
update_modified_column();
create trigger update_income_sources_modtime before update on income_sources for each row execute function
update_modified_column();
create trigger update_outgoings_modtime before update on outgoings for each row execute function
update_modified_column();
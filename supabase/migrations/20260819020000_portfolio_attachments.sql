CREATE TABLE portfolio_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    portfolio_entry_id uuid not null references portfolio_entries(id) on delete cascade, 
    user_id text not null references "user"(id) on delete cascade, 
    kind attachment_kind not null, 
    storage_path text not null, 
    file_name text not null, 
    mime_type varchar(255) not null, 
    size_bytes bigint not null, 
    created_at timestamptz default now()
);

create index idx_portfolio_attachments_user_id on portfolio_attachments (user_id);
create index idx_portfolio_attachments_entry_id on portfolio_attachments (portfolio_entry_id);
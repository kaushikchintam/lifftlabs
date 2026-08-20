create type test_type as enum ('ucat', 'gamsat', 'mcat');
CREATE TABLE test_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text not null REFERENCES "user"(id) ON DELETE CASCADE, 
    test_type test_type not null,
    sitting_date date not null,
    score text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_test_scores_user_id on test_scores (user_id);

create trigger update_test_scores_modtime
    before update on test_scores
    for each row
    execute function update_modified_column();
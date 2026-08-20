create type learner_stage as enum ('applicant', 'med_student', 'resident');

CREATE TABLE stage_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    stage learner_stage not null,
    effective_from timestamptz not null default now(),
    reason text default null
);

create index idx_stage_transitions_user_effective on stage_transitions (user_id, effective_from desc);
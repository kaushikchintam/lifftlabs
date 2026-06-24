-- Move linkedin_url from learner_profiles to profiles
ALTER TABLE public.learner_profiles DROP COLUMN linkedin_url;
ALTER TABLE public.profiles ADD COLUMN linkedin_url text;

-- Update mentor_profiles: specialty as array, add available_days and one_liner
ALTER TABLE public.mentor_profiles
  ALTER COLUMN specialty TYPE text[] USING ARRAY[specialty],
  ADD COLUMN available_days text[],
  ADD COLUMN one_liner text;

-- Mentor applications table (pending applications before approval)
create type application_status as enum ('pending', 'approved', 'rejected');

create table mentor_applications (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  email text not null unique,
  linkedin_url text not null,

  status application_status default 'pending',

  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id) on delete set null,

  created_at timestamptz default now()
);

-- RLS for mentor_applications (admin only via service role)
alter table public.mentor_applications enable row level security;

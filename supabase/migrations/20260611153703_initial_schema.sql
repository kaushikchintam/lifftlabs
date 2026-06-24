-- Enums
create type user_role as enum ('learner', 'mentor', 'admin');
create type milestone_type as enum ('exam_prep', 'application', 'interview', 'clinical', 'document', 'custom');
create type content_type as enum ('video', 'article', 'quiz', 'exercise');
create type cohort_status as enum ('forming', 'active', 'completed');
create type member_status as enum ('active', 'graduated', 'dropped');
create type progress_status as enum ('active', 'paused', 'completed');
create type portfolio_item_type as enum ('milestone', 'certificate', 'project', 'reflection');
create type session_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type payment_item_type as enum ('session', 'program');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- Auto-update updated_at columns
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- -------------------------
-- Core profiles
-- -------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'learner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create table learner_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_position text,
  target_role text,
  background text,
  years_experience int,
  linkedin_url text,
  updated_at timestamptz default now()
);

create trigger set_learner_profiles_updated_at
  before update on learner_profiles
  for each row execute function handle_updated_at();

create table mentor_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  specialty text,
  current_position text,
  years_in_healthcare int,
  is_verified bool default false,
  hourly_rate_pence int,
  updated_at timestamptz default now()
);

create trigger set_mentor_profiles_updated_at
  before update on mentor_profiles
  for each row execute function handle_updated_at();

-- -------------------------
-- Pathways & content
-- -------------------------

create table pathways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references profiles(id),
  target_role text,
  source_background text,
  estimated_weeks int,
  is_published bool default false,
  created_at timestamptz default now()
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  pathway_id uuid not null references pathways(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null,
  milestone_type milestone_type,
  is_required bool default true,
  unique (pathway_id, order_index)
);

create table microlearning_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content_type content_type,
  content_url text,
  content_body text,
  milestone_id uuid references milestones(id) on delete set null,
  pathway_id uuid not null references pathways(id) on delete cascade,
  duration_minutes int,
  order_index int,
  created_at timestamptz default now(),
  unique (pathway_id, order_index)
);

-- -------------------------
-- Programs & cohorts
-- -------------------------

create table programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  mentor_id uuid not null references profiles(id),
  pathway_id uuid not null references pathways(id),
  max_cohort_size int,
  price_pence int default 0,
  is_published bool default false,
  created_at timestamptz default now()
);

create table cohorts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  name text,
  start_date date,
  end_date date,
  status cohort_status default 'forming',
  created_at timestamptz default now()
);

create table cohort_members (
  cohort_id uuid not null references cohorts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  enrolled_at timestamptz default now(),
  status member_status default 'active',
  primary key (cohort_id, user_id)
);

-- -------------------------
-- Progress tracking
-- -------------------------

create table user_pathway_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pathway_id uuid not null references pathways(id) on delete cascade,
  current_milestone_id uuid references milestones(id) on delete set null,
  status progress_status default 'active',
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, pathway_id)
);

create table milestone_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  milestone_id uuid not null references milestones(id) on delete cascade,
  completed_at timestamptz default now(),
  notes text,
  evidence_url text,
  unique (user_id, milestone_id)
);

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  description text,
  item_type portfolio_item_type,
  milestone_completion_id uuid references milestone_completions(id) on delete set null,
  is_public bool default false,
  created_at timestamptz default now()
);

-- -------------------------
-- Sessions & messaging
-- -------------------------

create table mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references profiles(id),
  learner_id uuid not null references profiles(id),
  cohort_id uuid references cohorts(id) on delete set null,
  scheduled_at timestamptz,
  duration_minutes int default 60,
  status session_status default 'pending',
  agora_channel text,
  notes text,
  created_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  last_message_at timestamptz
);

create table conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- -------------------------
-- Payments
-- -------------------------

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  amount_pence int not null,
  currency text default 'gbp',
  stripe_payment_intent_id text unique,
  item_type payment_item_type,
  program_id uuid references programs(id) on delete set null,
  session_id uuid references mentor_sessions(id) on delete set null,
  status payment_status default 'pending',
  created_at timestamptz default now()
);

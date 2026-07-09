-- Better Auth uses string IDs, not UUIDs.
-- Drop RLS policies and FK constraint, change user_id to text.
DROP POLICY IF EXISTS "Learner and their mentor can read" ON public.learner_profiles;
DROP POLICY IF EXISTS "Only learner can insert their own profile" ON public.learner_profiles;
DROP POLICY IF EXISTS "Only learner can update their own profile" ON public.learner_profiles;
DROP POLICY IF EXISTS "Only learner can delete their own profile" ON public.learner_profiles;
ALTER TABLE public.learner_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles DROP CONSTRAINT IF EXISTS learner_profiles_user_id_fkey;
ALTER TABLE public.learner_profiles ALTER COLUMN user_id TYPE text;

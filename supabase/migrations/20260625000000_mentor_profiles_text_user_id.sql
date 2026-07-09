-- Better Auth uses string IDs, not UUIDs.
-- Drop RLS policies, FK, and PK constraints, change user_id to text, re-add PK.
DROP POLICY IF EXISTS "Anyone can read mentor profiles" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Only mentor can insert their own profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Only mentor can update their own profile" ON public.mentor_profiles;
DROP POLICY IF EXISTS "Only mentor can delete their own profile" ON public.mentor_profiles;
ALTER TABLE public.mentor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles DROP CONSTRAINT mentor_profiles_pkey;
ALTER TABLE public.mentor_profiles DROP CONSTRAINT mentor_profiles_user_id_fkey;
ALTER TABLE public.mentor_profiles ALTER COLUMN user_id TYPE text;
ALTER TABLE public.mentor_profiles ADD PRIMARY KEY (user_id);

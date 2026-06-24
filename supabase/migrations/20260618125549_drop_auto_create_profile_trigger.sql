-- Role is chosen by the user during signup, not defaulted to learner.
-- Profile row is created explicitly during the signup form submission.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

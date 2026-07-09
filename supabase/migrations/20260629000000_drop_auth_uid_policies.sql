-- Drop the auth.users FK from profiles (Better Auth doesn't write to auth.users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ── Drop all auth.uid() policies (permanently broken with Better Auth) ──

-- profiles
DROP POLICY IF EXISTS "Anyone can read public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only yourself can update your profile" ON public.profiles;

-- pathways
DROP POLICY IF EXISTS "Anyone can read published pathways" ON public.pathways;
DROP POLICY IF EXISTS "Only creator can insert pathways" ON public.pathways;
DROP POLICY IF EXISTS "Only creator can update pathways" ON public.pathways;
DROP POLICY IF EXISTS "Only creator can delete pathways" ON public.pathways;

-- milestones
DROP POLICY IF EXISTS "Enrolled users, creator and mentor can read milestones" ON public.milestones;
DROP POLICY IF EXISTS "Only pathway creator can insert milestones" ON public.milestones;
DROP POLICY IF EXISTS "Only pathway creator can update milestones" ON public.milestones;
DROP POLICY IF EXISTS "Only pathway creator can delete milestones" ON public.milestones;

-- microlearning_modules
DROP POLICY IF EXISTS "Enrolled users, creator and mentor can read microlearning modules" ON public.microlearning_modules;
DROP POLICY IF EXISTS "Only pathway creator can insert microlearning modules" ON public.microlearning_modules;
DROP POLICY IF EXISTS "Only pathway creator can update microlearning modules" ON public.microlearning_modules;
DROP POLICY IF EXISTS "Only pathway creator can delete microlearning modules" ON public.microlearning_modules;

-- programs
DROP POLICY IF EXISTS "Anyone can read published programs" ON public.programs;
DROP POLICY IF EXISTS "Only mentor can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Only mentor can update programs" ON public.programs;
DROP POLICY IF EXISTS "Only mentor can delete programs" ON public.programs;

-- cohorts
DROP POLICY IF EXISTS "Members of the cohort can read" ON public.cohorts;
DROP POLICY IF EXISTS "Only mentor can insert cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Only mentor can update cohorts" ON public.cohorts;
DROP POLICY IF EXISTS "Only mentor can delete cohorts" ON public.cohorts;

-- cohort_members
DROP POLICY IF EXISTS "Member and mentor can read cohort members" ON public.cohort_members;
DROP POLICY IF EXISTS "Only mentor can enroll members" ON public.cohort_members;
DROP POLICY IF EXISTS "Member can leave, mentor can remove" ON public.cohort_members;

-- user_pathway_progress
DROP POLICY IF EXISTS "Only yourself can read pathway progress" ON public.user_pathway_progress;
DROP POLICY IF EXISTS "Only yourself can insert pathway progress" ON public.user_pathway_progress;
DROP POLICY IF EXISTS "Only yourself can update pathway progress" ON public.user_pathway_progress;
DROP POLICY IF EXISTS "Only yourself can delete pathway progress" ON public.user_pathway_progress;

-- milestone_completions
DROP POLICY IF EXISTS "Only yourself can read milestone completions" ON public.milestone_completions;
DROP POLICY IF EXISTS "Only yourself can insert milestone completions" ON public.milestone_completions;
DROP POLICY IF EXISTS "Only yourself can update milestone completions" ON public.milestone_completions;
DROP POLICY IF EXISTS "Only yourself can delete milestone completions" ON public.milestone_completions;

-- portfolio_items
DROP POLICY IF EXISTS "Public items anyone can read, private only yourself" ON public.portfolio_items;
DROP POLICY IF EXISTS "Only yourself can insert portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Only yourself can update portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Only yourself can delete portfolio items" ON public.portfolio_items;

-- mentor_sessions
DROP POLICY IF EXISTS "Mentor and learner in session can read" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Both parties can insert mentor sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Both parties can update mentor sessions" ON public.mentor_sessions;
DROP POLICY IF EXISTS "Both parties can delete mentor sessions" ON public.mentor_sessions;

-- conversations
DROP POLICY IF EXISTS "Participants can read conversations" ON public.conversations;

-- conversation_participants
DROP POLICY IF EXISTS "Participants can read conversation participants" ON public.conversation_participants;

-- messages
DROP POLICY IF EXISTS "Participants of conversation can read messages" ON public.messages;
DROP POLICY IF EXISTS "Only sender can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Only sender can update messages" ON public.messages;
DROP POLICY IF EXISTS "Only sender can delete messages" ON public.messages;

-- payments
DROP POLICY IF EXISTS "Only yourself can read payments" ON public.payments;

-- ── Re-enable RLS with no policies on tables that had it disabled ──
-- (no policies = service role bypasses, anon key blocked)
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

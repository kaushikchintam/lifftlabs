-- ========================
-- PROFILES
-- ========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Only yourself can update your profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ========================
-- LEARNER_PROFILES
-- ========================
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner and their mentor can read"
ON public.learner_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.programs
    JOIN public.cohorts ON cohorts.program_id = programs.id
    JOIN public.cohort_members ON cohort_members.cohort_id = cohorts.id
    WHERE cohort_members.user_id = learner_profiles.user_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only learner can insert their own profile"
ON public.learner_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only learner can update their own profile"
ON public.learner_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only learner can delete their own profile"
ON public.learner_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ========================
-- MENTOR_PROFILES
-- ========================
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mentor profiles"
ON public.mentor_profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Only mentor can insert their own profile"
ON public.mentor_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only mentor can update their own profile"
ON public.mentor_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only mentor can delete their own profile"
ON public.mentor_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ========================
-- PATHWAYS
-- ========================
ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pathways"
ON public.pathways
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "Only creator can insert pathways"
ON public.pathways
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only creator can update pathways"
ON public.pathways
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only creator can delete pathways"
ON public.pathways
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);


-- ========================
-- MILESTONES
-- ========================
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users, creator and mentor can read milestones"
ON public.milestones
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_pathway_progress
    WHERE user_pathway_progress.pathway_id = milestones.pathway_id
    AND user_pathway_progress.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = milestones.pathway_id
    AND pathways.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.pathway_id = milestones.pathway_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only pathway creator can insert milestones"
ON public.milestones
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = milestones.pathway_id
    AND pathways.created_by = auth.uid()
  )
);

CREATE POLICY "Only pathway creator can update milestones"
ON public.milestones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = milestones.pathway_id
    AND pathways.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = milestones.pathway_id
    AND pathways.created_by = auth.uid()
  )
);

CREATE POLICY "Only pathway creator can delete milestones"
ON public.milestones
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = milestones.pathway_id
    AND pathways.created_by = auth.uid()
  )
);


-- ========================
-- MICROLEARNING_MODULES
-- ========================
ALTER TABLE public.microlearning_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users, creator and mentor can read microlearning modules"
ON public.microlearning_modules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_pathway_progress
    WHERE user_pathway_progress.pathway_id = microlearning_modules.pathway_id
    AND user_pathway_progress.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = microlearning_modules.pathway_id
    AND pathways.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.pathway_id = microlearning_modules.pathway_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only pathway creator can insert microlearning modules"
ON public.microlearning_modules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = microlearning_modules.pathway_id
    AND pathways.created_by = auth.uid()
  )
);

CREATE POLICY "Only pathway creator can update microlearning modules"
ON public.microlearning_modules
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = microlearning_modules.pathway_id
    AND pathways.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = microlearning_modules.pathway_id
    AND pathways.created_by = auth.uid()
  )
);

CREATE POLICY "Only pathway creator can delete microlearning modules"
ON public.microlearning_modules
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pathways
    WHERE pathways.id = microlearning_modules.pathway_id
    AND pathways.created_by = auth.uid()
  )
);


-- ========================
-- PROGRAMS
-- ========================
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published programs"
ON public.programs
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "Only mentor can insert programs"
ON public.programs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Only mentor can update programs"
ON public.programs
FOR UPDATE
TO authenticated
USING (auth.uid() = mentor_id)
WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Only mentor can delete programs"
ON public.programs
FOR DELETE
TO authenticated
USING (auth.uid() = mentor_id);


-- ========================
-- COHORTS
-- ========================
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members of the cohort can read"
ON public.cohorts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cohort_members
    WHERE cohort_members.cohort_id = cohorts.id
    AND cohort_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.id = cohorts.program_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only mentor can insert cohorts"
ON public.cohorts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.id = cohorts.program_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only mentor can update cohorts"
ON public.cohorts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.id = cohorts.program_id
    AND programs.mentor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.id = cohorts.program_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only mentor can delete cohorts"
ON public.cohorts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.programs
    WHERE programs.id = cohorts.program_id
    AND programs.mentor_id = auth.uid()
  )
);


-- ========================
-- COHORT_MEMBERS
-- ========================
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member and mentor can read cohort members"
ON public.cohort_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.programs
    JOIN public.cohorts ON cohorts.program_id = programs.id
    WHERE cohorts.id = cohort_members.cohort_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Only mentor can enroll members"
ON public.cohort_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.programs
    JOIN public.cohorts ON cohorts.program_id = programs.id
    WHERE cohorts.id = cohort_members.cohort_id
    AND programs.mentor_id = auth.uid()
  )
);

CREATE POLICY "Member can leave, mentor can remove"
ON public.cohort_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.programs
    JOIN public.cohorts ON cohorts.program_id = programs.id
    WHERE cohorts.id = cohort_members.cohort_id
    AND programs.mentor_id = auth.uid()
  )
);


-- ========================
-- USER_PATHWAY_PROGRESS
-- ========================
ALTER TABLE public.user_pathway_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only yourself can read pathway progress"
ON public.user_pathway_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only yourself can insert pathway progress"
ON public.user_pathway_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only yourself can update pathway progress"
ON public.user_pathway_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only yourself can delete pathway progress"
ON public.user_pathway_progress
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ========================
-- MILESTONE_COMPLETIONS
-- ========================
ALTER TABLE public.milestone_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only yourself can read milestone completions"
ON public.milestone_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only yourself can insert milestone completions"
ON public.milestone_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only yourself can update milestone completions"
ON public.milestone_completions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only yourself can delete milestone completions"
ON public.milestone_completions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ========================
-- PORTFOLIO_ITEMS
-- ========================
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public items anyone can read, private only yourself"
ON public.portfolio_items
FOR SELECT
TO public
USING (
  is_public = true
  OR auth.uid() = user_id
);

CREATE POLICY "Only yourself can insert portfolio items"
ON public.portfolio_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only yourself can update portfolio items"
ON public.portfolio_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only yourself can delete portfolio items"
ON public.portfolio_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- ========================
-- MENTOR_SESSIONS
-- ========================
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor and learner in session can read"
ON public.mentor_sessions
FOR SELECT
TO authenticated
USING (
  auth.uid() = mentor_id
  OR auth.uid() = learner_id
);

CREATE POLICY "Both parties can insert mentor sessions"
ON public.mentor_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = mentor_id
  OR auth.uid() = learner_id
);

CREATE POLICY "Both parties can update mentor sessions"
ON public.mentor_sessions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = mentor_id
  OR auth.uid() = learner_id
)
WITH CHECK (
  auth.uid() = mentor_id
  OR auth.uid() = learner_id
);

CREATE POLICY "Both parties can delete mentor sessions"
ON public.mentor_sessions
FOR DELETE
TO authenticated
USING (
  auth.uid() = mentor_id
  OR auth.uid() = learner_id
);


-- ========================
-- CONVERSATIONS
-- ========================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- INSERT/UPDATE/DELETE handled via service_role in backend only


-- ========================
-- CONVERSATION_PARTICIPANTS
-- ========================
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read conversation participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- INSERT handled via service_role in backend only


-- ========================
-- MESSAGES
-- ========================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants of conversation can read messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Only sender can insert messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Only sender can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Only sender can delete messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);


-- ========================
-- PAYMENTS
-- ========================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only yourself can read payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE handled via service_role in Stripe webhook handler only

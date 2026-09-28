-- Nullable per-user override for the pot goal shown in PotCard. NULL means
-- "use the stage default from POT_CONFIGS" (features/finances/components/data/pot-configs.ts).
ALTER TABLE learner_profiles ADD COLUMN finance_pot_goal_pence int;

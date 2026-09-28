-- Set Aside gets its own explicit field instead of being inferred by
-- scanning income_sources for a row literally labeled "savings".
ALTER TABLE learner_profiles ADD COLUMN finance_set_aside_pence int;

-- Lets ScenariosCard's "no part-time income" scenario subtract real
-- tracked income instead of doubling the shortfall as a stand-in.
ALTER TABLE income_sources ADD COLUMN is_part_time boolean not null default false;

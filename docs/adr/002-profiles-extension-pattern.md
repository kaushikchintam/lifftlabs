# ADR 002 — Profiles Extension Pattern

## Status
Accepted

## Context
LIFT has two distinct user roles — learners and mentors — each with different profile fields. We needed a way to store shared user data (name, avatar) alongside role-specific data (e.g. `hourly_rate_pence` for mentors, `target_role` for learners) without polluting a single table with many nullable columns.

## Decision
Use three tables:
- `profiles` — shared data for all users, 1:1 with `auth.users`
- `learner_profiles` — learner-specific fields, 1:1 with `profiles`
- `mentor_profiles` — mentor-specific fields, 1:1 with `profiles`

## Reasons
- A single `profiles` table with nullable mentor/learner columns would be messy and hard to enforce — a learner row would have empty mentor columns and vice versa
- Extension tables are clean: each table only contains relevant fields
- Querying is straightforward — join `profiles` with the relevant extension table when needed
- Easier to add a new role in future (e.g. `admin_profiles`) without altering the core `profiles` table

## Consequences
- Queries that need role-specific data require a join
- When a user's role changes, the old extension row must be deleted and a new one created
- Application code must know which extension table to read based on `profiles.role`

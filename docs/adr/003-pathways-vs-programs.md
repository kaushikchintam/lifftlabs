# ADR 003 — Pathways vs Programs

## Status
Accepted

## Context
LIFT supports two modes of learning: a learner independently following a structured curriculum, and a mentor grouping learners with similar goals into a cohort. We needed to decide whether these were the same concept or different ones.

## Decision
Keep `pathways` and `programs` as separate tables with a clear distinction:
- **Pathway** — the learning content and structure (milestones, modules). Reusable, standalone, not tied to any mentor or price.
- **Program** — a mentor wrapping a pathway into a group offering with a cohort, price, and schedule.

## Reasons
- A pathway can be followed solo by any learner without a mentor — it is content, not a service
- A mentor may run multiple programs (different cohorts, different prices) based on the same pathway without duplicating content
- Separating them means content can be improved independently of the programs built on top of it
- Real example: a UCAT exam prep pathway can be followed solo, or a mentor can create a "UCAT Bootcamp" program using that pathway for a specific cohort intake

## Consequences
- Two concepts to explain to users — the UI must make the distinction clear
- Progress tracking must handle both cases: `user_pathway_progress` for solo learners, `cohort_members` for program learners
- Need to ensure a learner enrolled in a program doesn't also create duplicate solo progress records for the same pathway

# ADR 004 — Store Monetary Values as Integer Pence

## Status
Accepted

## Context
LIFT handles payments for mentor sessions and programs. We needed to decide how to store monetary values in the database.

## Decision
Store all monetary values as integers representing pence (e.g. £10.00 = `1000`). The currency is stored separately as a text field (default `gbp`).

## Reasons
- Floating point numbers (float, double) cannot represent all decimal values exactly — this causes rounding errors that are unacceptable for money
- Integers are exact — there is no rounding error when storing or retrieving pence values
- Stripe, which we use for payment processing, also uses integer minor units (pence/cents) natively — no conversion needed when creating payment intents
- Simple arithmetic on integers is safe; arithmetic on floats is not

## Consequences
- All display logic must divide by 100 to show a human-readable price (e.g. `1000 / 100 = £10.00`)
- Any UI input for prices must multiply by 100 before saving
- A utility function should be used consistently for formatting pence to display strings to avoid ad-hoc division throughout the codebase

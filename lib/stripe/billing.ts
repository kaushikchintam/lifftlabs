import Stripe from "stripe";

// Scoped restricted key (Recurring subscriptions and billing template) —
// deliberately separate from STRIPE_SECRET_KEY, which the old per-session
// booking flow and mentor Connect onboarding still use.
export const stripeBilling = new Stripe(process.env.STRIPE_BILLING_KEY!);

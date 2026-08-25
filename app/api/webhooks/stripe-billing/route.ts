import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

//Signature verification needs the raw requests bytes
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_BILLING_KEY!);

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    if(!signature) {
        return NextResponse.json({ error: "missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody, 
            signature, 
            process.env.STRIPE_BILLING_WEBHOOK_SECRET!
        );
    } catch {
        return NextResponse.json({ error: "invalid signature"}, { status: 400 });
    }

    // Idempotency
    const { error: ledgerError } = await supabaseAdmin
      .from("stripe_events")
      .insert({ id: event.id, type: event.type });

    if (ledgerError) {
        if (ledgerError.code === "23505") {
            return NextResponse.json({ received: true, duplicate: true });
        }
        return NextResponse.json({ error: "ledger_unavailable"}, { status: 500 });
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.mode !== "subscription" || !session.subscription) break;

            if (!session.client_reference_id) {
                console.error(`checkout.session.completed ${session.id} has no client_reference_id — can't identify the learner`);
                break;
            }

            const { data: updated, error } = await supabaseAdmin
                .from("learner_profiles")
                .update({
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    subscription_status: "active",
                })
                .eq("user_id", session.client_reference_id)
                .select("user_id");

            if (error) {
                console.error("learner_profiles update failed:", error);
                return NextResponse.json({ error: "update_failed" }, { status: 500 });
            }
            if (!updated || updated.length === 0) {
                // Not a transient failure — retrying won't fix a missing row.
                // Loud and visible instead of silently swallowed.
                console.error(`checkout.session.completed ${session.id}: no learner_profiles row for user_id ${session.client_reference_id}`);
            }
            break;
        }

        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            // current_period_end moved onto each subscription item in
            // recent API versions — we only ever have one item (single
            // price, quantity 1), so the first item's period is the sub's.
            const periodEnd = sub.items.data[0]?.current_period_end;
            await supabaseAdmin
                .from("learner_profiles")
                .update({
                    subscription_status: sub.cancel_at_period_end ? "canceling" : sub.status,
                    ...(periodEnd && { current_period_end: new Date(periodEnd * 1000).toISOString() }),
                })
                .eq("stripe_subscription_id", sub.id);
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await supabaseAdmin
                .from("learner_profiles")
                .update({ subscription_status: "canceled" })
                .eq("stripe_subscription_id", sub.id);
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            // Invoice.subscription moved under parent.subscription_details
            // in recent API versions.
            const subRef = invoice.parent?.subscription_details?.subscription;
            const subId = typeof subRef === "string" ? subRef : subRef?.id;
            if (!subId) break;

            await supabaseAdmin
                .from("learner_profiles")
                .update({ subscription_status: "past_due" })
                .eq("stripe_subscription_id", subId);
            break;
        }
    }

    return NextResponse.json({ received: true });
}
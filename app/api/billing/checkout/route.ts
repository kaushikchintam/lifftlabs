import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripeBilling } from "@/lib/stripe/billing";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const checkout = await stripeBilling.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        allow_promotion_codes: true,
        // Ties the webhook back to this learner — Stripe only gives us the
        // Stripe customer ID otherwise, which doesn't exist on first checkout.
        client_reference_id: session.user.id,
        customer_email: session.user.email ?? undefined,
        success_url: `${process.env.BETTER_AUTH_URL}/dashboard?subscribed=true`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/subscribe`,
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
}

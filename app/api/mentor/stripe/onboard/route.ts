// create/reuse Express account, mint Account Link
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/mentor/stripe/onboard (P4-01)
 * 
 * Creates the mentor's Stripe Connect Express account on first call and 
 * REUSES it on every call after, that resuse is what makes onboarding 
 * resumable after abandonment: Account Links against an existing account
 * pick up at the first missing requirement, not from scratch. 
 * 
 * LIFFT never touches bank details or identify documents; Stripe's hosted
 * pages collect everything. We store only the account id and, via the 
 * account.updated webhook, a readiness boolean. 
 * 
 * Returns { url } - the client redirects the browser there. 
 */
export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = guard.session.user.id;

    const { data: mentor } = await supabaseAdmin
      .from("mentor_profiles")
      .select("user_id, stripe_account_id, charges_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (!mentor) {
        return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });
    }  

    try {
        let accountId = mentor.stripe_account_id as string | null;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country: "GB", 
                email: guard.session.user.email ?? undefined,
                business_type: "individual", 
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },  
                },
                business_profile: {
                    product_description: "One-to-one career mentoring sessions",
                },
                metadata: { mentor_id: userId }, 
            });
            accountId = account.id;

            await supabaseAdmin
              .from("mentor_profiles")
              .update({ stripe_account_id: accountId })
              .eq("user_id", userId);
        }

        const link = await stripe.accountLinks.create({
            account: accountId, 
            type: "account_onboarding",
            // Expired/used link -> this route mints a fresh one and bounces back
            refresh_url: `${process.env.BETTER_AUTH_URL}/api/mentor/stripe/refresh`,
            //Back to the dashboard with an honest "submitted, verifying" state - 
            //charges_enabled flips asynchronously via the account.updated webhook. 
            return_url: `${process.env.BETTER_AUTH_URL}/dashboard?payouts=submitted`,
        });

        return NextResponse.json({ url: link.url });
    } catch (err) {
        console.error("Connect onboarding failed:", err);
        return NextResponse.json({ error: "onboarding_failed" }, { status: 502 });
    }
}
// expired-link bounce
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * GET /api/mentor/stripe/refresh (P4-01)
 * 
 * Account Links are single-use and expire within minutes. Stripe send the 
 * mentor here when their link dies mid-flow; we mint a fresh one and bounce 
 * them straight back into boarding - a brief redirect, never an error page. 
 */

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.redirect(
            new URL("/login", process.env.BETTER_AUTH_URL!)
        );
    }

    const { data: mentor } = await supabaseAdmin 
      .from("mentor_profiles")
      .select("stripe_account_id")
      .eq("user_id", guard.session.user.id)
      .maybeSingle();

    if (!mentor?.stripe_account_id) {
        // No account to resume - send them to the dashboard where the 
        // setup banner starts the flow properly. 
        return NextResponse.redirect(
            new URL("/dashboard", process.env.BETTER_AUTH_URL!)
        );
    }

    try { 
        const link = await stripe.accountLinks.create({
            account: mentor.stripe_account_id, 
            type: "account_onboarding",
            refresh_url: `${process.env.BETTER_AUTH_URL}/api/mentor/stripe/refresh`,
            return_url: `${process.env.BETTER_AUTH_URL}/dashboard?payouts=submitted`,
        });

        return NextResponse.redirect(link.url);
    } catch (err) {
        console.error("Account Link refresh failed:", err);
        return NextResponse.redirect(
            new URL("/dashboard?payouts=error", process.env.BETTER_AUTH_URL!)
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripeBilling } from "@/lib/stripe/billing";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
        .from("learner_profiles")
        .select("stripe_customer_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (!profile?.stripe_customer_id) {
        return NextResponse.json({ error: "no_subscription" }, { status: 404 });
    }

    const portalSession = await stripeBilling.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.BETTER_AUTH_URL}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
}

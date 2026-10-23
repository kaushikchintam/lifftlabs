import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { stripeBilling } from "@/lib/stripe/billing";
import { isPlus } from "@/lib/auth/role";

const schema = z.object({
  // Same-site path to come back to after Checkout.
  returnTo: z.string().regex(/^\/(?!\/)/).max(300).default("/dashboard"),
});

/** POST /api/billing/checkout — LIFFT Plus subscription Checkout. */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (await isPlus(session.user.id)) return NextResponse.json({ error: "already_member" }, { status: 409 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const back = `${process.env.BETTER_AUTH_URL}${parsed.data.returnTo}`;

  const checkout = await stripeBilling.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    allow_promotion_codes: true,
    // Ties the webhook back to this learner; there's no Stripe customer yet on first checkout.
    client_reference_id: session.user.id,
    customer_email: session.user.email ?? undefined,
    success_url: back,
    cancel_url: back,
  });

  return NextResponse.json({ checkoutUrl: checkout.url });
}

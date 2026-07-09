import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    stripeLink: z.string().optional(),
})

export async function POST(request: NextRequest) {
    const body = await request.json()
    const result = schema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.flatten() },
            { status: 400 },
        )
    }

    const { fullName, email, stripeLink } = result.data

    await auth.api.signInMagicLink({
        body: {
            email, 
            callbackURL: "/onboarding/mentor",
            metadata: { fullName, stripeLink, isAdminApproval: true },
        },
        headers: request.headers,
    })

    await supabaseAdmin
      .from("mentor_applications")
      .update({ status: "approved" })
      .eq("email", email);

    return NextResponse.json({ success: true })
}
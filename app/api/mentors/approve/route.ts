import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const schema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    stripeLink: z.string().optional(),
})

export async function POST(request: NextRequest) {
    const body = await request.json()
    const result = schema.safeParse(body);
    const guard = await requireAdmin(request.headers);
    if (!guard.ok) {
        return NextResponse.json(
            { error: guard.status === 401 ? "Unauthorized" : "Forbidden" },
            { status: guard.status }
        );
    }

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
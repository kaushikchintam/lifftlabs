//POST handler, renders MentorRejectionEmail, sends via Resend POST /api/mentors/reject — sends rejection email via Resend
import { z } from "zod";
import React from "react";
import { render } from "@react-email/render";
import { MentorRejectionEmail } from "@/emails/mentor-rejected";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const schema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    reapplyLink: z.url().optional(),
})

export async function POST(request: NextRequest) {
    const body = await request.json()
    const result = schema.safeParse(body);
    const guard = await requireAdmin(request.headers);
    if (!guard.ok) {
        return NextResponse.json(
            { error: guard.status === 401 ? "Unauthorized": "Forbidden" },
            { status: guard.status }
        );
    }
    
    if(!result.success) {
        return NextResponse.json(
            { error: result.error.flatten() },
            { status: 400 },
         )
    }

    const { fullName, email, reapplyLink } = result.data

    const html = await render(
        React.createElement(MentorRejectionEmail, { fullName, reapplyLink })
    )

    await resend.emails.send({
        from: "LIFFT <hello@mail.lifft-dev.co.uk>",
        to: email,
        subject: 'Your mentor profile has been rejected',
        html,
    })

    await supabaseAdmin
      .from("mentor_applications")
      .update({ status: "rejected" })
      .eq("email", email);

    return NextResponse.json({
        success: true
    }
    )

}
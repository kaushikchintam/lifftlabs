//POST handler, renders MentorApprovalEmail, sends via Resend
import { z } from "zod";
import React from "react";
import { render } from "@react-email/render";
import { MentorApprovalEmail } from "@/emails/mentor-approved";
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend/client";

const schema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    profileLink: z.url(),
    stripeLink: z.url(),
})

export async function POST(request: Request) {
    const body = await request.json()
    const result = schema.safeParse(body);

    if(!result.success) {
        return NextResponse.json(
            { error: result.error.flatten() },
            { status: 400 },
         )
    }

    const { fullName, email, profileLink, stripeLink } = result.data

    const html = await render(
        React.createElement(MentorApprovalEmail, { fullName, profileLink, stripeLink })
    )

    resend.emails.send({
        from: "LIFFTLABS <no-reply@yourdomain.com>",
        to: email,
        subject: 'Your mentor profile has been approved',
        html,
    }
    )

    return NextResponse.json({
        success: true
    }
    )
}
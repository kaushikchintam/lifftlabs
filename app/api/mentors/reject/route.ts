//POST handler, renders MentorRejectionEmail, sends via Resend
import { z } from "zod";
import React from "react";
import { render } from "@react-email/render";
import { MentorRejectionEmail } from "@/emails/mentor-rejected";
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend/client";

const schema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    reapplyLink: z.url().optional(),
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

    const { fullName, email, reapplyLink } = result.data

    const html = await render(
        React.createElement(MentorRejectionEmail, { fullName, reapplyLink })
    )

    resend.emails.send({
        from: "LIFFTLABS <no-reply@yourdomain.com>",
        to: email,
        subject: 'Your mentor profile has been rejected',
        html, 
    })

    return NextResponse.json({
        success: true
    }
    )

}
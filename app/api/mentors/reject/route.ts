//POST handler, renders MentorRejectionEmail, sends via Resend POST /api/mentors/reject — sends rejection email via Resend
import { z } from "zod";
import React from "react";
import { render } from "@react-email/render";
import { MentorRejectionEmail } from "@/emails/mentor-rejected";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const schema = z.object({ applicationId: z.uuid() })

export async function POST(request: NextRequest) {
    const result = schema.safeParse(await request.json().catch(() => null));
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

    const { data: app } = await supabaseAdmin
      .from("mentor_applications")
      .select("id, full_name, email")
      .eq("id", result.data.applicationId)
      .maybeSingle();
    if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const email = app.email as string;

    const html = await render(
        React.createElement(MentorRejectionEmail, { fullName: app.full_name, reapplyLink: undefined })
    )

    await resend.emails.send({
        from: "LIFFT <hello@mail.lifft-dev.co.uk>",
        to: email,
        subject: 'Your mentor profile has been rejected',
        html,
    })

    await supabaseAdmin
      .from("mentor_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: guard.session.user.id })
      .eq("id", app.id);

    return NextResponse.json({
        success: true
    }
    )

}
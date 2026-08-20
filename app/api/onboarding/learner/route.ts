import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/index";
import { supabaseAdmin } from "@/lib/supabase/admin";

const VALID_STAGES = ["applicant", "med_student", "resident"] as const;

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({headers: req.headers});
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorize"}, {status: 401});
    }

    const { current_position, target_role, primary_concern, stage } = await req.json();

    if (!VALID_STAGES.includes(stage)) {
        return NextResponse.json({ error: "invalid_stage" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("learner_profiles").insert({
        user_id: session.user.id,
        current_position,
        target_role,
        primary_concern,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500});

    const { error: stageError } = await supabaseAdmin.from("stage_transitions").insert({
        user_id: session.user.id,
        stage, 
        reason: "onboarding",
    });

    if (stageError) return NextResponse.json({ error: stageError.message }, { status: 500});

    const response = NextResponse.json({ success: true});

    response.cookies.set("role", "learner", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    })

    response.cookies.set("stage", stage, {
        httpOnly: true, 
        sameSite: "lax", 
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    })

    return response
}
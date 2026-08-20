//POST, inserts a stage_transition row
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

const VALID_STAGES = ["applicant", "med_student", "resident"] as const;
type LearnerStage = (typeof VALID_STAGES)[number];

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }

    const { stage, reason } = await request.json();

    if (!VALID_STAGES.includes(stage)) {
        return NextResponse.json({ error: "invalid_stage" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("stage_transitions").insert({
        user_id: guard.session.user.id,
        stage: stage as LearnerStage, 
        reason: reason ?? null, 
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("stage");
    return response;
}
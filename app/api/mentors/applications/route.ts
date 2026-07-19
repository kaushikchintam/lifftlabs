//GET /api/mentors/applications — fetches pending applications from DB
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";


export async function GET(req: NextRequest) {

    const guard = await requireAdmin(req.headers);
        if (!guard.ok) {
            return NextResponse.json(
                { error: guard.status === 401 ? "Unauthorized" : "Forbidden" },
                { status: guard.status }
            );
        }
    
    const { data, error } = await supabaseAdmin
    .from("mentor_applications")
    .select("id, full_name, email, linkedin_url, created_at")
    .eq("status", "pending");

    if (error) {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
    }

    return NextResponse.json({applications: data})
}
//GET /api/mentors/applications — fetches pending applications from DB
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";


export async function GET(req: NextRequest) {
    
    const { data } = await supabaseAdmin
    .from("mentor_applications")
    .select("id, full_name, email, linkedin_url, created_at")
    .eq("status", "pending");

    return NextResponse.json({applications: data})
}
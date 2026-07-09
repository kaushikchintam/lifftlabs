//POST /api/mentors/applications/status — flips a row to approved or rejected
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";


export async function POST(req: NextRequest) {
    const { id, status } = await req.json();

    const { error } =  await supabaseAdmin.from("mentor_applications")
    .update({status})
    .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true })
}
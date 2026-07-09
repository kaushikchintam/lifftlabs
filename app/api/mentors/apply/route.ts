import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { fullName, workEmail, linkedinOrPortfolio } = await req.json();

  if (!fullName || !workEmail || !linkedinOrPortfolio) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("mentor_applications").insert({
    full_name: fullName,
    email: workEmail,
    linkedin_url: linkedinOrPortfolio,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

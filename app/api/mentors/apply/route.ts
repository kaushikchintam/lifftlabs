import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publicFormLimiter, rateLimitKey } from "@/lib/rate-limit";
import { JOURNEYS, MAX_PRICE, MIN_PRICE, journeyTags } from "@/features/journeys/config";

const SLUGS = JOURNEYS.map((j) => j.slug) as [string, ...string[]];

const schema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  roleTitle: z.string().trim().min(1).max(120),
  linkedin: z.string().trim().min(1).max(300),
  price: z.number().int().min(MIN_PRICE).max(MAX_PRICE),
  journeys: z.array(z.enum(SLUGS)).min(1),
  tags: z.array(z.string()).min(1),
  credentials: z.string().trim().min(1).max(2000),
  livedExperience: z.string().trim().min(1).max(2000),
});

/** POST /api/mentors/apply — public "Become a LIFFT mentor" form. */
export async function POST(req: NextRequest) {
  const { success } = await publicFormLimiter.limit(rateLimitKey(req));
  if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const a = parsed.data;

  // Only tags that belong to the chosen journeys.
  const allowed = new Set(JOURNEYS.filter((j) => a.journeys.includes(j.slug)).flatMap(journeyTags));

  const { error } = await supabaseAdmin.from("mentor_applications").insert({
    full_name: a.fullName,
    email: a.email.toLowerCase(),
    linkedin_url: a.linkedin,
    role_title: a.roleTitle,
    price_pence: a.price * 100,
    journeys: a.journeys,
    tags: a.tags.filter((t) => allowed.has(t)),
    credentials: a.credentials,
    lived_experience: a.livedExperience,
  });

  if (error?.code === "23505") return NextResponse.json({ error: "already_applied" }, { status: 409 });
  if (error) {
    console.error("[apply] insert failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

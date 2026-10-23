import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { JOURNEYS, MAX_PRICE, MIN_PRICE, topicsFor } from "@/features/journeys/config";

const SLUGS = JOURNEYS.map((j) => j.slug) as [string, ...string[]];

const schema = z.object({
  headline: z.string().trim().min(1).max(120),
  bio: z.string().trim().min(1).max(2000),
  credentials: z.string().trim().min(1).max(2000),
  price: z.number().int().min(MIN_PRICE).max(MAX_PRICE),
  journeys: z.array(z.enum(SLUGS)).min(1),
  tags: z.array(z.string()).min(1),
});

/** PATCH /api/mentor/profile — a mentor edits what learners see. Booked sessions keep their price. */
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const p = parsed.data;
  const allowed = new Set(topicsFor(p.journeys));
  const tags = p.tags.filter((t) => allowed.has(t));
  if (!tags.length) return NextResponse.json({ error: "invalid_tags" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("mentor_profiles")
    .update({
      headline: p.headline,
      bio: p.bio,
      credentials: p.credentials,
      hourly_rate_pence: p.price * 100,
      journeys: p.journeys,
      tags,
    })
    .eq("user_id", session.user.id)
    .select("user_id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });
  return NextResponse.json({ ok: true });
}

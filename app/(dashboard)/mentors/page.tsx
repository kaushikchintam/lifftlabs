import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ChevronRight } from "lucide-react";

/**
 * Mentor browse — /mentors. The learner's entry point into booking:
 * lists approved mentors, each card → /book/[mentorId].
 *
 * Only payment-ready mentors (charges_enabled) are shown at all — a mentor
 * mid-Stripe-verification simply doesn't appear yet, which matches the
 * booking route's hard gate. At two-mentor scale a flat list is the whole
 * feature; search/filter/matching is deliberately post-validation.
 */

interface MentorCard {
  user_id: string;
  one_liner: string | null;
  current_position: string | null;
  specialty: string | null;
  hourly_rate_pence: number | null;
  user: { name: string } | null;
}

export default async function MentorsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { data, error } = await supabaseAdmin
    .from("mentor_profiles")
    .select(
        `user_id, one_liner, current_position, specialty, hourly_rate_pence,
        user:user!mentor_profiles_user_id_fkey(name)`
    )
    .eq("charges_enabled", true)
    // .order("created_at", { ascending: true });
    
    if (error) console.error("mentors query failed:", error);

  const mentors = (data ?? []) as unknown as MentorCard[];

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-8">
        <h2 className="font-archivo-black text-5xl text-[#18150F] mb-2">
          Mentors
        </h2>
        <p className="font-dm-sans text-lg text-[#6F6B60]">
          People who've walked the path you're on. Pick a mentor to see their
          available times.
        </p>
      </div>

      {mentors.length === 0 ? (
        <div className="border border-[#E8E2D6] rounded-xl p-8">
          <p className="font-dm-sans text-sm text-[#6F6B60]">
            No mentors are open for booking just yet — check back soon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {mentors.map((m) => (
            <Link
              key={m.user_id}
              href={`/book/${m.user_id}`}
              className="border border-[#E8E2D6] rounded-xl p-6 hover:bg-[#FBF7EE] transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#18150F] flex items-center justify-center flex-shrink-0">
                  <span className="font-dm-sans text-white text-sm font-medium">
                    {(m.user?.name || "?")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-dm-sans text-base text-[#18150F] font-medium mb-0.5">
                    {m.user?.name || "Mentor"}
                  </p>
                  {m.current_position && (
                    <p className="font-dm-sans text-sm text-[#6F6B60] mb-1">
                      {m.current_position}
                      {m.specialty ? ` · ${m.specialty}` : ""}
                    </p>
                  )}
                  {m.one_liner && (
                    <p className="font-dm-sans text-sm text-[#18150F]">
                      {m.one_liner}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {m.hourly_rate_pence != null && (
                  <span className="font-dm-sans text-sm text-[#18150F] font-medium">
                    £{(m.hourly_rate_pence / 100).toFixed(0)}/session
                  </span>
                )}
                <span className="font-dm-sans text-xs text-[#6F6B60] flex items-center gap-1">
                  See times <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
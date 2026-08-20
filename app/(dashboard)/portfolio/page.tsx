import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentStage } from "@/lib/stage";
import { ApplicantLockedView } from "@/features/portfolio/components/applicant-locked-view";
import { PortfolioBoard } from "@/features/portfolio/components/portfolio-board";

export default async function PortfolioPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const stage = await getCurrentStage(session.user.id);

  let experienceHours = 0;
  let testScoresCount = 0;

  if (stage !== "med_student" && stage !== "resident") {
    const [{ data: logs }, { count }] = await Promise.all([
      supabaseAdmin
        .from("experience_log_with_hours")
        .select("live_hours")
        .eq("user_id", session.user.id),
      supabaseAdmin
        .from("test_scores")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id),
    ]);

    experienceHours = Math.round(
      (logs ?? []).reduce((sum, l) => sum + (Number(l.live_hours) || 0), 0)
    );
    testScoresCount = count ?? 0;
  }

  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 font-dm-sans text-xs font-bold uppercase tracking-wide text-brand">
            <span className="inline-block h-px w-4 bg-brand" />
            Evidence that follows you into applications
          </span>
          <h1 className="font-dm-serif text-5xl text-ink">Portfolio</h1>
        </div>

        {stage === "med_student" || stage === "resident" ? (
          <PortfolioBoard stage={stage} />
        ) : (
          <ApplicantLockedView experienceHours={experienceHours} testScoresCount={testScoresCount} />
        )}
      </div>
    </div>
  );
}

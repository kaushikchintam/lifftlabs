import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getCurrentStage } from "@/lib/stage";
import { FinancesBoard } from "@/features/finances/components/finances-board";
import type { FinanceStage } from "@/features/finances/components/data/pot-configs";

export default async function FinancesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const rawStage = await getCurrentStage(session.user.id);
  const stage: FinanceStage =
    rawStage === "med_student" || rawStage === "resident" ? rawStage : "applicant";

  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="font-dm-serif text-5xl text-ink">Transition finances</h1>
        <FinancesBoard stage={stage} />
      </div>
    </div>
  );
}

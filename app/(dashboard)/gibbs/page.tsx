import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { GibbsBoard } from "@/features/gibbs/components/gibbs-board";

export default async function GibbsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-dm-serif text-5xl text-ink">Reflection</h1>
        <GibbsBoard />
      </div>
    </div>
  );
}

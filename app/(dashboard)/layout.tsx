import { cookies } from "next/headers";
import { getServerSession } from "@/lib/auth/session";
import { getCurrentStage } from "@/lib/stage";
import Sidebar from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Stages } from "@/components/layout/nav-items";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const role = (session?.session as { role?: "mentor" | "learner"})?.role ?? "learner";

  // proxy.ts backfills this cookie whenever it's missing, but the very
  // first render after a stage change (or before proxy.ts has had a
  // chance to run) can still land here with nothing set — fall back to
  // the real DB lookup rather than ever hardcoding a stage again.
  let stage: Stages;
  if (role === "mentor") {
    stage = "mentor";
  } else {
    const cookieStage = (await cookies()).get("stage")?.value as Stages | undefined;
    stage = cookieStage ?? (session ? ((await getCurrentStage(session.user.id)) ?? "applicant") : "applicant");
  }

  const name = session?.user.name ?? "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userName={name} initials={initials} stage={stage} />
      <main className="flex-1 overflow-y-auto bg-[#FAF8F3] pb-16 md:pb-0">{children}</main>
      <MobileNav stage={stage} />
    </div>
  );
}
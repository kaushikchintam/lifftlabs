import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/require-admin";
import { SpaceTabs } from "@/components/layout/space-tabs";
import { hasMedSchoolTools, roleOf } from "@/lib/auth/role";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-lf-page text-lf-ink">
      {/* ponytail: one-line scale-down of the px-sized dashboard UI; replace with real type/spacing tokens if it ever needs per-page tuning */}
      <div style={{ zoom: 0.8 }}>
      <header className="border-b border-lf-line bg-white px-4 py-6 md:px-16">
        <Link href="/" className="text-[28px] font-bold tracking-[0.06em]">
          LIFFTLABS
        </Link>
      </header>

      <main className="px-4 py-14 md:px-16">
        <div className="mx-auto max-w-[1280px]">
          <SpaceTabs
            isAdmin={isAdminEmail(session.user.email)}
            isMentor={(await roleOf(session.user.id)) === "mentor"}
            medSchool={await hasMedSchoolTools(session.user.id)}
          />
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}

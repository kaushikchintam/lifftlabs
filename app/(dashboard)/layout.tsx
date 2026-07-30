import { getServerSession } from "@/lib/auth/session";
import Sidebar from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const role = (session?.session as { role?: "mentor" | "learner"})?.role ?? "learner";
  const name = session?.user.name ?? "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userName={name} initials={initials} role={role} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      <MobileNav role={role} />
    </div>
  );
}
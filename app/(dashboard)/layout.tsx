import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user.name ?? "";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userName={name} initials={initials} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

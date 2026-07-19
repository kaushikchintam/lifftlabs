import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Sidebar from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user.name ?? "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Nav variant only — every destination re-derives authorization
  // server-side (ADR 011), so this check is UX, not security.
  let role: "mentor" | "learner" = "learner";
  if (session) {
    const { data: mentorProfile } = await supabaseAdmin
      .from("mentor_profiles")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (mentorProfile) role = "mentor";
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar userName={name} initials={initials} role={role} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
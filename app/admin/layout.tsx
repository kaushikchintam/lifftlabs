import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTabs } from "@/features/admin/components/admin-tabs";

/** LIFFT team console. proxy.ts already gates /admin; this is the second lock. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || !isAdminEmail(session.user.email)) redirect("/dashboard");

  const [{ count: pending }, { count: waiting }] = await Promise.all([
    supabaseAdmin.from("mentor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("waitlist").select("id", { count: "exact", head: true }).is("notified_at", null),
  ]);

  return (
    <div className="min-h-screen bg-lf-page px-4 py-8 text-lf-ink md:px-12">
      <div className="mx-auto max-w-[1680px]">
        <p className="text-[15px] tracking-[0.12em] text-lf-muted">LIFFT TEAM CONSOLE</p>
        <AdminTabs pending={pending ?? 0} waiting={waiting ?? 0} />
        {children}
      </div>
    </div>
  );
}

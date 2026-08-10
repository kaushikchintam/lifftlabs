import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ChecklistBoard, type Section } from "@/features/checklist/components/checklist-board";

export default async function ChecklistPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { data } = await supabaseAdmin
    .from("checklist_sections")
    .select(
      `
      id, title,
      checklist_steps (
        id, title, status,
        checklist_notes ( id, content, created_at )
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .order("created_at", { referencedTable: "checklist_steps", ascending: true })
    .order("created_at", { referencedTable: "checklist_steps.checklist_notes", ascending: true });

  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <ChecklistBoard initialSections={(data ?? []) as unknown as Section[]} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { roleOf } from "@/lib/auth/role";
import { btnPrimary } from "@/components/ui/lifft";
import { conversationsByCounterpart, intakesById, rebookHref, sessionsFor } from "@/features/space/queries";
import { SessionsFull, type RowActions } from "@/features/space/components/sessions-list";

export default async function MySessionsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  const userId = session.user.id;
  const role = await roleOf(userId);

  const rows = await sessionsFor(userId, role);
  const [convos, intakes] = await Promise.all([
    conversationsByCounterpart(userId),
    intakesById(rows.map((r) => r.intakeId)),
  ]);

  const actions = new Map<string, RowActions>(
    rows.map((r) => {
      const cid = convos.get(role === "mentor" ? r.learnerId : r.mentorId);
      const intake = r.intakeId ? intakes.get(r.intakeId) : undefined;
      return [r.id, { messageHref: cid ? `/messages/${cid}` : null, rebookHref: rebookHref(r, intake, true) }];
    })
  );
  const latest = rows[0];

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-medium">My sessions</h1>
        {role === "learner" && latest && (
          <Link href={rebookHref(latest, latest.intakeId ? intakes.get(latest.intakeId) : undefined, false)} className={btnPrimary}>
            Book with a different mentor
          </Link>
        )}
      </div>
      <SessionsFull rows={rows} role={role} actions={actions} />
    </>
  );
}

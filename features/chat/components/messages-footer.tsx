import Link from "next/link";
import { getServerSession } from "@/lib/auth/session";
import { roleOf } from "@/lib/auth/role";
import { btnSecondary } from "@/components/ui/lifft";
import { intakesById, rebookHref, sessionsFor } from "@/features/space/queries";

/** Learner-only: "Book with a different mentor" / "Explore another journey". */
export async function MessagesFooter() {
  const session = await getServerSession();
  if (!session || (await roleOf(session.user.id)) === "mentor") return null;

  const [latest] = await sessionsFor(session.user.id, "learner");
  const intake = latest?.intakeId ? (await intakesById([latest.intakeId])).get(latest.intakeId) : undefined;

  return (
    <div className="space-y-3 border-t border-lf-line p-6 text-center">
      {latest && (
        <Link href={rebookHref(latest, intake, false)} className={`${btnSecondary} w-full`}>
          Book with a different mentor
        </Link>
      )}
      <Link href="/#journeys" className="block text-[17px] underline">
        Explore another journey
      </Link>
    </div>
  );
}

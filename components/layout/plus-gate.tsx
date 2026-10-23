import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { hasMedSchoolTools, isPlus } from "@/lib/auth/role";
import { PlusBanner } from "./plus-banner";

/** Medical-school learners only. Non-members get a read-only preview (`inert`);
 *  the create APIs enforce Plus server-side. */
export async function PlusGate({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || !(await hasMedSchoolTools(session.user.id))) redirect("/dashboard");
  const member = await isPlus(session.user.id);

  return (
    <>
      <PlusBanner member={member} />
      {member ? children : <div inert className="opacity-70">{children}</div>}
    </>
  );
}

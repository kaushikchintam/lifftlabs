import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { roleOf } from "@/lib/auth/role";
import { LearnerHome } from "@/features/space/components/learner-home";
import { MentorHome } from "@/features/mentor/components/mentor-home";

export default async function HomePage(props: PageProps<"/dashboard">) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { booked } = await props.searchParams;
  const name = session.user.name || "there";

  return (await roleOf(session.user.id)) === "mentor" ? (
    <MentorHome userId={session.user.id} name={name} />
  ) : (
    <LearnerHome userId={session.user.id} firstName={name.split(" ")[0]} justBooked={booked === "1"} />
  );
}

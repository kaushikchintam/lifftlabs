import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/features/mentor/components/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const { data: p } = await supabaseAdmin
    .from("mentor_profiles")
    .select("headline, bio, credentials, hourly_rate_pence, journeys, tags")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (!p) redirect("/dashboard");

  return (
    <>
      <PageHeader title="Your profile" subtitle="What learners see on the Mentors tab and your match card." />
      <ProfileForm
        initial={{
          headline: p.headline ?? "",
          bio: p.bio ?? "",
          credentials: p.credentials ?? "",
          price: p.hourly_rate_pence ? String(p.hourly_rate_pence / 100) : "",
          journeys: p.journeys as string[],
          tags: p.tags as string[],
        }}
      />
    </>
  );
}

/**
 * learner booking: slots grouped by day, price on the button, 
 * 409 handled by refreshing the list, then hands the browser to
 * Stripe.
 */
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SlotPicker } from "@/features/booking/components/slot-picker";
import * as Sentry from "@sentry/nextjs";

/** Book a session with a mentor (P3-08) */
export default async function BookPage({
    params, 
}: {
    params: Promise<{ mentorId: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        Sentry.metrics.count("users_redirected_login", 1);
        redirect("/login");
    }
    

    const { mentorId } = await params;

    const [{ data: mentorUser }, { data: profile }] = await Promise.all([
        supabaseAdmin.from("user").select("name").eq("id", mentorId).maybeSingle(), 
        supabaseAdmin
           .from("mentor_profiles")
           .select("one_liner, current_position, specialty")
           .eq("user_id", mentorId)
           .maybeSingle(), 
    ]);

    if (!mentorUser || !profile) notFound();

    return (
        <div className="mx-auto max-w-2xl space-y-8 p-6">
            <header>
                <h1 className="font-dm-sans text-2xl">{mentorUser.name}</h1>
                {profile.current_position && (
                    <p className="font-dm-sans text-sm text-muted-foreground">{profile.current_position}</p> 
                )}
                {profile.one_liner && <p className="font-dm-sans mt-2 text-sm">{profile.one_liner}</p>}
            </header>

            <section>
                <h2 className="font-dm-sans text-lg mb-4">Pick a time</h2>
                <SlotPicker mentorId={mentorId} />
            </section>
        </div>
    );
}
//learner history — /payments
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
/** Payment history - learner side (P4-04). URL: /payments */

interface PaymentRow {
    id: string;
    amount_pence: number;
    currency: string;
    status: string;
    created_at: string;
    session_id: string | null;
    session: {
        scheduled_at: string;
        timezone: string;
        mentor: { name: string } | null;
    } | null;
}

export default async function PaymentsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const { data } = await supabaseAdmin 
      .from("payments")
      .select(
        `id, amount_pence, currency, status, created_at, session_id,
       session:mentor_sessions(
         scheduled_at, timezone,
         mentor:user!mentor_sessions_mentor_id_fkey(name)
        ) `
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    const payments = (data ?? []) as unknown as PaymentRow[]

    const dateFmt = new Intl.DateTimeFormat("en-GB", {
        day: "numeric", 
        month: "short", 
        year: "numeric",
    });

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
            <h1 className="font-archivo-black text-2xl text-[#18150F] tracking-widest uppercase">Payments</h1>

            {payments.length === 0 ? (
                <p className="font-dm-sans text-sm text-[#6F6B60]">
                    No payments yet — they will appear here after your first booking.
                </p>
            ) : (
                <div className="space-y-3">
                    {payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] px-5 py-4 shadow-sm">
                            <div>
                                <p className="font-dm-sans font-semibold text-[#18150F]">
                                    Session{p.session?.mentor?.name ? ` with ${p.session.mentor.name}` : ""}
                                </p>
                                <p className="font-dm-sans text-sm text-[#6F6B60] mt-0.5">
                                    Paid {dateFmt.format(new Date(p.created_at))}
                                    {p.session_id && (
                                        <>
                                            {" · "}
                                            <Link
                                                href={`/sessions/${p.session_id}`}
                                                className="text-[#2596BE] hover:underline underline-offset-2">
                                                view session
                                            </Link>
                                        </>
                                    )}
                                </p>
                            </div>
                            <p className="font-dm-sans font-semibold text-[#18150F]">
                                £{(p.amount_pence / 100).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
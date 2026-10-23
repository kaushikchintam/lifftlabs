import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPence } from "@/utils/format-date";
import { FUNNEL_STEPS, funnelByJourney, isRealLearner, liveJourneyCount, mentorRows, paidBookings } from "@/features/admin/stats";
import { JOURNEYS, PLATFORM_FEE_PERCENT } from "@/features/journeys/config";

export const metadata = { title: "Team console" };

export default async function AdminOverviewPage() {
  const [bookings, mentors, funnel, { count: pending }, { count: waiting }] = await Promise.all([
    paidBookings(),
    mentorRows(),
    funnelByJourney(),
    supabaseAdmin.from("mentor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("waitlist").select("id", { count: "exact", head: true }).is("notified_at", null),
  ]);

  const paid = bookings.filter((b) => !b.refunded_at);
  const real = paid.filter((b) => isRealLearner(b.learner?.email));
  const gross = paid.reduce((s, b) => s + (b.amount_pence ?? 0), 0);
  const revenue = paid.reduce((s, b) => s + (b.fee_pence ?? 0), 0);
  const live = mentors.filter((m) => !m.paused && m.hoursCount > 0).length;
  const firstReal = real.at(-1);

  const tiles = [
    ["Paid sessions", String(paid.length), `${real.length} real · ${paid.length - real.length} team test`],
    ["Gross bookings", formatPence(gross), "Before refunds"],
    ["LIFFT revenue", formatPence(revenue), `${PLATFORM_FEE_PERCENT}% application fee`],
    ["Live mentors", String(live), `${pending ?? 0} awaiting review`],
    ["Waitlist", String(waiting ?? 0), "Not yet notified"],
    ["Journeys live", `${liveJourneyCount(mentors)}/${JOURNEYS.length}`, "Need a live mentor"],
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-lf-ink px-7 py-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[15px] tracking-[0.1em]">THE MILESTONE THAT MATTERS</p>
          <p className="text-[23px] font-medium">First real person paying for a real session</p>
        </div>
        <p className="text-[17px]">
          {firstReal ? `Done — ${firstReal.learner?.name ?? "a learner"} with ${firstReal.mentor?.name ?? "a mentor"}` : "Not yet — book one as a learner to test the loop"}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-lf-line bg-white p-6">
            <p className="text-[17px] text-lf-muted">{label}</p>
            <p className="my-1 text-4xl font-semibold">{value}</p>
            <p className="text-[15px] text-lf-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-lf-line bg-white p-7">
        <div className="mb-4 flex flex-wrap justify-between gap-2">
          <h2 className="text-[23px] font-medium">Funnel by journey</h2>
          <p className="text-[15px] text-lf-muted">Distinct people · includes team test bookings</p>
        </div>
        <table className="w-full min-w-[900px] text-left text-[17px]">
          <thead>
            <tr className="border-b border-lf-line text-[15px] text-lf-muted">
              <th className="py-3 font-normal">Journey</th>
              {FUNNEL_STEPS.map((s) => <th key={s} className="py-3 font-normal">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {funnel.rows.map((r) => (
              <tr key={r.slug} className="border-b border-lf-line">
                <td className="py-4 font-medium">{r.title}</td>
                {r.counts.map((n, i) => <td key={i} className={`py-4 ${n ? "" : "text-[#BDBDBD]"}`}>{n}</td>)}
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-4">All journeys</td>
              {funnel.total.map((n, i) => <td key={i} className={`py-4 ${n ? "" : "text-[#BDBDBD]"}`}>{n}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

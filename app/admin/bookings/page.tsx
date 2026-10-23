import { Pill } from "@/components/ui/lifft";
import { formatPence, formatSession } from "@/utils/format-date";
import { isRealLearner, paidBookings } from "@/features/admin/stats";
import { RefundButton } from "@/features/admin/components/refund-button";

export default async function AdminBookingsPage() {
  const bookings = await paidBookings();

  return (
    <div className="overflow-x-auto rounded-2xl border border-lf-line bg-white">
      <table className="w-full min-w-[960px] text-left text-[17px]">
        <thead>
          <tr className="border-b border-lf-line text-[15px] text-lf-muted">
            {["Learner", "Mentor", "Session", "Status", "Amount", "Fee", "Payout", ""].map((h) => (
              <th key={h} className="px-5 py-4 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr><td colSpan={8} className="px-5 py-6 text-lf-muted">No paid bookings yet.</td></tr>
          )}
          {bookings.map((b) => {
            const payout = b.refunded_at ? "Refunded" : b.transferred_at ? "Paid out" : "Pending";
            return (
              <tr key={b.id} className="border-b border-lf-line last:border-0">
                <td className="px-5 py-4">
                  <p className="font-semibold">{b.learner?.name ?? "—"}</p>
                  {!isRealLearner(b.learner?.email) && <p className="text-[15px] text-lf-muted">Team test</p>}
                </td>
                <td className="px-5 py-4">{b.mentor?.name ?? "—"}</td>
                <td className="px-5 py-4">{formatSession(b.scheduled_at)}</td>
                <td className="px-5 py-4">
                  <Pill tone={b.refunded_at ? "refunded" : b.status}>
                    {b.refunded_at ? "Refunded" : b.status[0].toUpperCase() + b.status.slice(1)}
                  </Pill>
                </td>
                <td className="px-5 py-4">{b.amount_pence != null ? formatPence(b.amount_pence) : "—"}</td>
                <td className="px-5 py-4">{b.fee_pence != null ? formatPence(b.fee_pence) : "—"}</td>
                <td className="px-5 py-4 text-lf-muted">{payout}</td>
                <td className="px-5 py-4 text-right">
                  {!b.refunded_at && <RefundButton sessionId={b.id} learnerName={b.learner?.name ?? "learner"} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

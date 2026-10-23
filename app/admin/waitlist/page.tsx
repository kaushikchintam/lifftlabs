import { supabaseAdmin } from "@/lib/supabase/admin";
import { getJourney } from "@/features/journeys/config";

export default async function AdminWaitlistPage() {
  const { data: rows } = await supabaseAdmin
    .from("waitlist")
    .select("id, email, journey, answers, notified_at, created_at")
    .order("created_at", { ascending: false });

  if (!rows?.length) {
    return <div className="rounded-2xl border border-lf-line bg-white p-7 text-[17px] text-lf-muted">Nobody on the waitlist.</div>;
  }

  return (
    <div className="space-y-4">
      {rows.map((w) => {
        const days = Math.floor((Date.now() - new Date(w.created_at).getTime()) / 86_400_000);
        return (
          <div key={w.id} className="grid gap-2 rounded-2xl border border-lf-line bg-white px-6 py-5 text-[17px] md:grid-cols-3 md:items-center">
            <div>
              <p className="text-[19px] font-semibold">{w.email}</p>
              <p className="text-lf-muted">
                {getJourney(w.journey)?.title ?? w.journey} · joined {days === 0 ? "today" : `${days}d ago`}
              </p>
            </div>
            <p>{Object.values(w.answers as Record<string, string[]>).flat().join(" · ") || "—"}</p>
            <p className="text-lf-muted">
              {w.notified_at ? `Notified ${new Date(w.notified_at).toLocaleDateString("en-GB")}` : "Waiting for a live mentor"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

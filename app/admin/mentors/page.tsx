import { supabaseAdmin } from "@/lib/supabase/admin";
import { Pill } from "@/components/ui/lifft";
import { getJourney } from "@/features/journeys/config";
import { mentorStatusLabel } from "@/lib/mentor-status";
import { formatPence } from "@/utils/format-date";
import { mentorRows } from "@/features/admin/stats";
import { ApplicationCard, type Application } from "@/features/admin/components/application-card";
import { PauseButton } from "@/features/mentor/components/mentor-actions";

export default async function AdminMentorsPage() {
  const [{ data: apps }, mentors] = await Promise.all([
    supabaseAdmin
      .from("mentor_applications")
      .select("id, full_name, email, linkedin_url, role_title, price_pence, journeys, tags, credentials, lived_experience, checks, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    mentorRows(),
  ]);

  return (
    <div className="space-y-6">
      {(apps as Application[] | null)?.map((a) => <ApplicationCard key={a.id} app={a} />)}

      <div className="overflow-x-auto rounded-2xl border border-lf-line bg-white">
        <table className="w-full min-w-[900px] text-left text-[17px]">
          <thead>
            <tr className="border-b border-lf-line text-[15px] text-lf-muted">
              {["Mentor", "Journeys", "Status", "Stripe", "Hours", "Price", ""].map((h) => (
                <th key={h} className="px-5 py-4 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mentors.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-6 text-lf-muted">No approved mentors yet.</td></tr>
            )}
            {mentors.map((m) => {
              const label = mentorStatusLabel({ hasProfile: true, hoursCount: m.hoursCount, paused: m.paused });
              return (
                <tr key={m.id} className="border-b border-lf-line last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-lf-muted">{m.headline}</p>
                  </td>
                  <td className="px-5 py-4">{m.journeys.map((j) => getJourney(j)?.title ?? j).join(", ")}</td>
                  <td className="px-5 py-4"><Pill tone={label.toLowerCase()}>{label}</Pill></td>
                  <td className="px-5 py-4">{m.chargesEnabled ? "Payouts on" : "Not connected"}</td>
                  <td className="px-5 py-4">{m.hoursCount ? `${m.hoursCount} window${m.hoursCount > 1 ? "s" : ""}` : "None"}</td>
                  <td className="px-5 py-4">{m.pricePence ? formatPence(m.pricePence) : "—"}</td>
                  <td className="px-5 py-4">
                    {(label === "Live" || label === "Paused") && <PauseButton paused={m.paused} mentorId={m.id} primary={false} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

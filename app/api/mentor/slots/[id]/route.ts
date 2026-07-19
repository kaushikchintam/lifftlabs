/**
 * withdraw. Ownership and state checks live in the WHERE clause, 
 * so there's no read-then-write race; held/booked slots are refused 
 * with the reasoning documented in the header comment. Withdrawn, never 
 * deleted, because sessions may reference the row.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * DELETE /api/mentor/slots/[id] — withdraw a published slot.
 *
 * Only the owning mentor, and only while the slot is still 'open'.
 * held  → a learner is mid-checkout: withdrawing would strand their payment.
 * booked → cancellation is a session-level action with refund implications,
 *          not a slot deletion. (Phase 4 policy work.)
 * Withdrawn, not deleted: mentor_sessions.slot_id may reference it later.
*/

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }>}
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const { data: updated, error } = await supabaseAdmin
      .from("mentor_open_slots")
      .update({ status: "withdrawn", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("mentor_id", guard.session.user.id) //ownership check in the WHERE
      .eq("status", "open")                   // state check in the WHERE
      .select("id")
      .maybeSingle();

      if (error) {
        console.error("slot withdrawn failed:", error);
        return NextResponse.json({ error: "withdraw_failed" }, {status: 500});
    }

    if (!updated) {
        // Not found, not yours, or no longer open, same answer, either way, 
        // and deliberately indistinguishable to the caller. 
        return NextResponse.json({ error: "not_withdrawable" }, { status: 409 });
    }

    return NextResponse.json({ withdrawn: true });
}
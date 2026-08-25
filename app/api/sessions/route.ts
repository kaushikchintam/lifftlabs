import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasPlatformAccess } from "@/lib/access";
import { createSessionCalendarEvent } from "@/lib/calendar/writeback";
import { sendSessionConfirmation } from "@/lib/emails/session-confirmation";

/** No payment step to wait on anymore — just enough to cover the RPC round trip. */
const HOLD_MINUTES = 5;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (!(await hasPlatformAccess(session.user.id))) {
    return NextResponse.json({ error: "subscription_required" }, { status: 402 });
  }

  let slotId: string | undefined;
  try {
    ({ slotId } = await request.json());
  } catch {
    /* fall through to the 400 below */
  }
  if (!slotId) {
    return NextResponse.json({ error: "slotId required" }, { status: 400 });
  }

  // 1. Load the slot — still needed to know the mentor for the
  //    conversation, even though pricing/charges_enabled no longer gate
  //    anything here.
  const { data: slot } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("id, mentor_id, status")
    .eq("id", slotId)
    .maybeSingle();

  if (!slot || slot.status !== "open") {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  // 2. Atomically hold the slot + create the pending session.
  const { data: sessionId, error: holdError } = await supabaseAdmin.rpc(
    "hold_slot",
    {
      p_slot_id: slotId,
      p_learner_id: session.user.id,
      p_hold_minutes: HOLD_MINUTES,
    }
  );

  if (holdError || !sessionId) {
    const gone =
      holdError?.message?.includes("slot_unavailable") ||
      holdError?.message?.includes("no_overlapping_sessions");
    return NextResponse.json(
      { error: gone ? "slot_unavailable" : "booking_failed" },
      { status: gone ? 409 : 500 }
    );
  }

  // 3. No payment step anymore — confirm immediately. Booking access is
  //    already gated on an active subscription above.
  const { data: confirmed, error: confirmError } = await supabaseAdmin.rpc(
    "confirm_session",
    { p_session_id: sessionId }
  );

  if (confirmError || !confirmed) {
    console.error("confirm_session failed:", confirmError);
    await supabaseAdmin.rpc("release_session", { p_session_id: sessionId });
    return NextResponse.json({ error: "booking_failed" }, { status: 500 });
  }

  // P6-03: conversation exists from first booking, idempotent by RPC design.
  supabaseAdmin
    .rpc("get_or_create_conversation", {
      p_user_a: slot.mentor_id,
      p_user_b: session.user.id,
    })
    .then(({ error }) => {
      if (error) console.error("conversation create failed:", error);
    });

  // Best-effort mirror to the mentor's Google Calendar + confirmation
  // email — previously fired from the checkout.session.completed webhook,
  // now happens synchronously since confirmation itself is synchronous.
  await createSessionCalendarEvent(sessionId).catch((err) =>
    console.error("[writeback] unexpected:", err)
  );
  await sendSessionConfirmation(sessionId).catch((err) =>
    console.error("[email] unexpected:", err)
  );

  return NextResponse.json({ sessionId });
}

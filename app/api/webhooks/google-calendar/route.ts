import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { syncMentorCalendar } from "@/lib/calendar/sync";

/**
 * Google Calendar push notifications (watch channel pings).
 * The ping carries NO event data, it only says "something changed, go look".
 * We identify the mentor from the stored (channel_id, resource_id) pair, 
 * NOT from the x-goog-channel-token header: anyone can POST here with a 
 * forged token, but the channel/resource pair only exists in the DB because 
 * WE registered it with Google. 
 */
export async function POST(request: NextRequest) {
    const channelId = request.headers.get("x-goog-channel-id");
    const resourceId = request.headers.get("x-goog-resource-id");
    const resourceState = request.headers.get("x-goog-resource-state");

    if(!channelId || !resourceId) {
        return new NextResponse(null, { status: 400 });
    }

    //Google sends state="sync" once when the channel is created, acknowledge.
    if (resourceState === "sync") {
        return new NextResponse(null, { status : 200 });
    }
    
    //Authenticate the ping: the pair must match a row we created.
    const { data: integration } = await supabaseAdmin
      .from("calendar_integrations")
      .select("mentor_id, status")
      .eq("channel_id", channelId)
      .eq("resource_id", resourceId)
      .eq("provider", "google")
      .maybeSingle();

    if(!integration) {
        //Unknown channel: stale (pre-reconnect) or forged. Return 200 so Google
        // stops retrying a channel we no longer track; do nothing else. 
        return new NextResponse(null, { status: 200 });
    }

    if (integration.status === "revoked") {
        return new NextResponse(null, { status: 200 });
    }

    try { 
        const result = await syncMentorCalendar(integration.mentor_id);
        console.log(
            `[gcal-webhook] mentor=${integration.mentor_id}`,
            JSON.stringify(result)
        );
    } catch (err) {
        // Log but still 200: Google retries on non-2xx, and a burst of retries
        // on a transient failure just amplifies load. The advisory lock in the 
        // sync RPCs makes overlapping retries safe anyway. 
        console.error("[gcal-webhook] sync failed:", err); 
    }

    return new NextResponse(null, { status: 200 });
}
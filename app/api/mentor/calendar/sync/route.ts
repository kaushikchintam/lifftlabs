import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-admin";
import { syncMentorCalendar } from "@/lib/calendar/sync";

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const result = await syncMentorCalendar(guard.session.user.id);
    return NextResponse.json(result);
}
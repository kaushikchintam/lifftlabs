"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function SyncButton() {
    const [syncing, setSyncing] = useState(false);

    async function sync() {
        setSyncing(true);
        await fetch("/api/mentor/calendar/sync").catch(() => {});
        setSyncing(false);
    }

    return (
        <button
            onClick={sync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D6] bg-[#FBF7EE] px-4 py-1.5 font-dm-sans text-sm font-semibold text-[#3A372F] hover:border-[#18150F] disabled:opacity-50 transition-colors"
        >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Refresh from Google"}
        </button>
    );
}

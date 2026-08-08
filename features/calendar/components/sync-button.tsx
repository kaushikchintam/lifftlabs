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
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE7DD] bg-white px-4 py-1.5 font-dm-sans text-sm font-semibold text-ink-body hover:border-ink disabled:opacity-50 transition-colors"
        >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Refresh from Google"}
        </button>
    );
}

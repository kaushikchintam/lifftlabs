// client button
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Calls the onboard route and hands the browser to Stripe's hosted flow. */
export function SetupPayoutsButton({ resuming }: { resuming: boolean }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    async function start() {
        setLoading(true);
        setError(false);
        const res = await fetch("/api/mentor/stripe/onboard", { method: "POST" });
        if (res.ok) {
            const { url } = await res.json();
            window.location.href = url ;
            return;
        }
        setError(true);
        setLoading(false);
    }

    return (
        <div className="flex items-center gap-3">
            <Button onClick={start} disabled={loading}>
                {loading
                  ? "Opening Stripe..."
                  : resuming
                    ? "Continue setup"
                    : "Set up payouts"}
            </Button>
            {error && (
                <p className="text-sm text-red-700">
                    Couldn't reach Stripe - try again in a moment. 
                </p>
            )}
        </div>
    );
} 
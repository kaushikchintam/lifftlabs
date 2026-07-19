"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { enableAnalytics } from "@/lib/posthog";

/**
 * SC-03 / CX-02 — consent banner. Analytics (PostHog) initialise ONLY after
 * accept; decline is remembered and equally respected. Strictly-necessary
 * cookies (sign-in) don't require consent and aren't gated here.
 */

const CONSENT_KEY = "lifft-analytics-consent"; // "granted" | "denied"

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "granted") {
      enableAnalytics();
    } else if (stored === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function decide(granted: boolean) {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
    if (granted) enableAnalytics();
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          We'd like to use analytics cookies to understand how LIFFT is used.
          Declining changes nothing about the service.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => decide(false)}>
            Decline
          </Button>
          <Button size="sm" onClick={() => decide(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
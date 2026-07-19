"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * After Stripe redirects back with ?payment=success, the webhook that 
 * flips pending -> confirmed may land a second or two later. While the
 * session is still pending, refresh the server component a few times 
 * instead of showing "Awaiting payment" to someone who just paid.
*/
export function PaymentStatusRefresher({ status }: { status: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const attempts = useRef(0);

    const justPaid = searchParams.get("payment") === "success";

    useEffect(() => {
        if (!justPaid || status !== "pending") return;
        if (attempts.current >= 5) return;

        const timer = setTimeout(() => {
            attempts.current += 1;
            router.refresh();
        }, 2000);

        return () => clearTimeout(timer);
    }, [justPaid, status, router]);

    if (justPaid && status === "pending" && attempts.current < 5) {
        return (
            <p className="text-sm text-muted-foreground">
                Confirming your payment...
            </p>
        );
    }
    return null;
}

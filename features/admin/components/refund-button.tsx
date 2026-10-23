"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnSecondary } from "@/components/ui/lifft";

export function RefundButton({ sessionId, learnerName }: { sessionId: string; learnerName: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirm" | "busy">("idle");

  if (state === "confirm") {
    return (
      <span className="flex items-center gap-2">
        <button
          className={`${btnSecondary} border-[#B42318] text-[#B42318]`}
          onClick={async () => {
            setState("busy");
            await fetch(`/api/admin/bookings/${sessionId}/refund`, { method: "POST" });
            router.refresh();
          }}
        >
          Refund {learnerName}?
        </button>
        <button className="text-[15px] text-lf-muted" onClick={() => setState("idle")}>Cancel</button>
      </span>
    );
  }
  return (
    <button className={btnSecondary} disabled={state === "busy"} onClick={() => setState("confirm")}>
      Refund
    </button>
  );
}

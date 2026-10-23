"use client";

import { useRouter } from "next/navigation";
import { btnSecondary } from "@/components/ui/lifft";

export function ArchiveButton({ conversationId, archived }: { conversationId: string; archived: boolean }) {
  const router = useRouter();
  return (
    <button
      className={btnSecondary}
      onClick={async () => {
        const res = await fetch(`/api/conversations/${conversationId}/archive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: !archived }),
        });
        if (res.ok) router.push("/messages");
      }}
    >
      {archived ? "Unarchive" : "Archive"}
    </button>
  );
}

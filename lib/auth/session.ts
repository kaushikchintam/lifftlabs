import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Memoized per-request. Every layout/page that calls this during the same
 * navigation reuses the first resolved result instead of re-querying.
 */
export const getServerSession = cache(async () => {
    return auth.api.getSession({ headers: await headers() });
});
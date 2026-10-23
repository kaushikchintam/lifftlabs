"use client";

import { authClient } from "@/lib/auth/client";
import { CodeForm } from "@/features/journeys/components/account-step";

/** Returning users who signed up but never entered their email code. */
export default function VerifyPage() {
  const { data, isPending } = authClient.useSession();
  const email = data?.user.email;

  return (
    <main className="min-h-screen bg-lf-page px-4 py-16 text-lf-ink">
      <div className="mx-auto max-w-[560px]">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">Verify your email</h1>
        <div className="rounded-2xl border border-lf-line bg-white p-8">
          {isPending ? (
            <p className="text-lf-muted">Loading…</p>
          ) : email ? (
            <CodeForm email={email} onVerified={() => (window.location.href = "/dashboard")} />
          ) : (
            <p className="text-lf-muted">Please log in again.</p>
          )}
        </div>
      </div>
    </main>
  );
}

"use client"

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (!token) { setError("Invalid or expired reset link."); return; }

    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) { setError(error.message ?? "Something went wrong."); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#2596BE] flex items-center justify-center mb-3">
          <span className="font-archivo-black text-white text-sm">LL</span>
        </div>
        <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">
          LIFFT LABS
        </span>
      </div>

      {done ? (
        <>
          <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">Password updated</h2>
          <p className="font-dm-sans text-[#6F6B60] text-sm">
            Redirecting you to sign in…
          </p>
        </>
      ) : (
        <>
          <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">Set a new password</h2>
          <p className="font-dm-sans text-[#6F6B60] text-sm mb-6">
            Choose a password you'll use to sign in to LIFFT Labs.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-dm-sans text-sm text-[#18150F]">New password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="font-dm-sans border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2596BE] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-dm-sans text-sm text-[#18150F]">Confirm password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className="font-dm-sans border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2596BE] transition-colors"
              />
              {error && <p className="font-dm-sans text-xs text-[#E63946] mt-1">{error}</p>}
            </div>
            <Button
              className="h-auto w-full bg-[#2596BE] hover:bg-[#1A7A9E] text-white rounded-full py-3 font-dm-sans"
              onClick={handleSubmit}
            >
              Update password
            </Button>
            <Link href="/login" className="font-dm-sans text-sm text-[#6F6B60] hover:text-[#18150F] transition-colors text-center">
              ← Back to sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-1/2 bg-[#2596BE] items-center justify-center">
        <h1 className="font-archivo-black text-white text-8xl leading-none tracking-tight">
          LIFFT<br />LABS
        </h1>
      </div>
      <div className="flex w-full md:w-1/2 bg-[#DDEBF3] items-center justify-center px-6">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

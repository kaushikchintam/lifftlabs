"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email) { setError("Enter your email address."); return; }
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    if (error) { setError(error.message ?? "Something went wrong."); return; }
    setSent(true);
  }

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-1/2 bg-[#2596BE] items-center justify-center">
        <h1 className="font-archivo-black text-white text-8xl leading-none tracking-tight">
          LIFFT<br />LABS
        </h1>
      </div>

      <div className="flex w-full md:w-1/2 bg-[#DDEBF3] items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-sm">

          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#2596BE] flex items-center justify-center mb-3">
              <span className="font-archivo-black text-white text-sm">LL</span>
            </div>
            <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">
              LIFFT LABS
            </span>
          </div>

          {sent ? (
            <>
              <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">Check your email</h2>
              <p className="font-dm-sans text-[#6F6B60] text-sm mb-6">
                We sent a reset link to <strong>{email}</strong>. It expires in 1 hour.
              </p>
              <Link href="/login" className="font-dm-sans text-sm text-[#2596BE] hover:underline">
                ← Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">Forgot your password?</h2>
              <p className="font-dm-sans text-[#6F6B60] text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-dm-sans text-sm text-[#18150F]">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="font-dm-sans border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2596BE] transition-colors"
                  />
                  {error && <p className="font-dm-sans text-xs text-[#E63946] mt-1">{error}</p>}
                </div>
                <Button
                  className="h-auto w-full bg-[#2596BE] hover:bg-[#1A7A9E] text-white rounded-full py-3 font-dm-sans"
                  onClick={handleSubmit}
                >
                  Send reset link
                </Button>
                <Link href="/login" className="font-dm-sans text-sm text-[#6F6B60] hover:text-[#18150F] transition-colors text-center">
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

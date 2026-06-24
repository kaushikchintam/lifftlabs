"use client";

import { signupSchema } from "@/features/auth/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LearnerSignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


return (
    <div className="flex h-screen">
        {/* Left panel */}
        <div className="relative hidden md:flex w-1/2">
          <img src="/images/learner-signup.jpg" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#2596BE]/70" />
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <span className="font-archivo-black text-white text-sm tracking-widest uppercase">LIFFT LABS</span>
            <div>
              <h2 className="font-archivo-black text-white text-4xl leading-tight mb-4">You didn't train this hard to feel stuck.</h2>
              <p className="font-dm-sans text-white/80 text-base italic">Someone who's been where you are is one match away.</p>
            </div>
            <span className="font-dm-sans text-white/60 text-sm">The platform built for healthcare transition</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex w-full md:w-1/2 bg-[#DDEBF3] items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-sm">

            {/* Logo mark */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#2596BE] flex items-center justify-center mb-3">
                <span className="font-archivo-black text-white text-sm">LL</span>
              </div>
              <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">LIFFT LABS</span>
            </div>

            {/* Heading */}
            <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">Create your account</h2>
            <p className="font-dm-sans text-[#6F6B60] text-sm mb-6">Join the platform built for healthcare transition.</p>

            <div className="flex flex-col gap-3">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-dm-sans text-sm text-[#18150F]">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(""); }}
                  className="font-dm-sans border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2596BE] transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="font-dm-sans text-sm text-[#18150F]">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="font-dm-sans border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2596BE] transition-colors"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="font-dm-sans text-sm text-[#18150F]">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="font-dm-sans border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2596BE] transition-colors"
                />
              </div>

              {error && <p className="font-dm-sans text-xs text-[#E63946]">{error}</p>}

              <Button
                className="h-auto w-full bg-[#2596BE] hover:bg-[#1A7A9E] text-white rounded-full py-3 font-dm-sans"
                onClick={() => {
                  const result = signupSchema.safeParse({ fullName, email, password });
                  if (!result.success) {
                    setError(result.error.issues[0].message);
                    return;
                  }
                  setError("");
                }}
              >
                Create account
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="font-dm-sans text-xs text-[#6F6B60]">Or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google */}
            <Button
              variant="outline"
              className="h-auto w-full rounded-full py-3 font-dm-sans text-sm gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Sign up with Google
            </Button>

            {/* Log in link */}
            <p className="font-dm-sans text-sm text-[#6F6B60] text-center mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#2596BE] font-medium hover:underline">Log in</Link>
            </p>

          </div>
        </div>
    </div>

    
)
}
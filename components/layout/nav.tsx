"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RolePicker from "@/components/marketing/role-picker";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-8 py-4 bg-white border-b border-border font-archivo-black">
        <Link href="/">LIFFT LABS</Link>
        <div className="hidden md:flex gap-8">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#mentors">Mentors</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            size="sm"
            className="h-auto bg-brand hover:bg-brand-hover text-white rounded-full px-5 py-2 font-dm-sans font-semibold"
            onClick={() => setOpen(true)}
          >
            Get started
          </Button>
        </div>
      </nav>
      <RolePicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RolePicker from "@/components/marketing/role-picker";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-border font-archivo-black">
        <span>LIFFT LABS</span>
        <div className="flex gap-8">
          <Link href="#">For users</Link>
          <Link href="#">Mentors</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            size="sm"
            className="h-auto bg-brand hover:bg-brand-hover text-white rounded-full px-5 py-2"
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

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RolePicker from "@/components/marketing/role-picker";

const SCROLL_RANGE = 80; // px of scroll over which the nav fully shrinks

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    function update() {
      setProgress(Math.min(window.scrollY / SCROLL_RANGE, 1));
      ticking.current = false;
    }
    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50" style={{ padding: `${progress * 16}px` }}>
        <nav
          className="mx-auto flex items-center justify-between border-b border-border bg-white font-archivo-black px-6"
          style={{
            maxWidth: `${9999 - progress * (9999 - 896)}px`,
            borderRadius: `${progress * 9999}px`,
            paddingTop: `${16 - progress * 4}px`,
            paddingBottom: `${16 - progress * 4}px`,
            backgroundColor: `rgba(255,255,255,${1 - progress * 0.2})`,
            backdropFilter: `blur(${progress * 12}px)`,
            WebkitBackdropFilter: `blur(${progress * 12}px)`,
            boxShadow: `0 10px 30px rgba(24,21,15,${progress * 0.12})`,
          }}
        >
          <Link href="/">LIFFT LABS</Link>
          <div className="hidden md:flex gap-8">
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#mentors">Mentors</Link>
            <Link href="/about">About</Link>
            <Link href="/subscribe">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden md:block overflow-hidden"
              style={{
                opacity: 1 - progress,
                maxWidth: `${(1 - progress) * 90}px`,
                marginRight: `${(1 - progress) * 12}px`,
              }}
            >
              <Button variant="ghost" size="sm" asChild className="whitespace-nowrap">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <Button
              size="sm"
              className="h-auto bg-brand hover:bg-brand-hover text-white rounded-full px-5 py-2 font-dm-sans font-semibold"
              onClick={() => setOpen(true)}
            >
              Get started
            </Button>
          </div>
        </nav>
      </div>

      {/* spacer so page content doesn't jump under the now-fixed nav */}
      <div style={{ height: `${73 + progress * 23}px` }} />

      <RolePicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}

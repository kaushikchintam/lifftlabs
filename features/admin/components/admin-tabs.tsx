"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/mentors", label: "Mentors", badge: "pending" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/waitlist", label: "Waitlist", badge: "waiting" },
] as const;

export function AdminTabs({ pending, waiting }: { pending: number; waiting: number }) {
  const pathname = usePathname();
  const current = TABS.find((t) => (t.href === "/admin" ? pathname === t.href : pathname.startsWith(t.href)));
  const counts = { pending, waiting };

  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-4xl font-bold tracking-tight">{current?.label ?? "Overview"}</h1>
        <Link href="/dashboard" className="text-[15px] text-lf-muted hover:text-lf-ink">Back to my space</Link>
      </div>
      <nav className="mb-7 flex gap-2 overflow-x-auto border-b border-lf-line">
        {TABS.map((t) => {
          const n = "badge" in t ? counts[t.badge] : 0;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-2 whitespace-nowrap border-b-[3px] px-4 pb-3 text-[19px] ${
                t === current ? "border-lf-ink text-lf-ink" : "border-transparent text-lf-muted hover:text-lf-ink"
              }`}
            >
              {t.label}
              {n > 0 && <span className="rounded-full bg-lf-ink px-2 text-[13px] font-semibold text-white">{n}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

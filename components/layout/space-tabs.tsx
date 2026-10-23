"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

const TABS: { href: string; label: string; plus?: boolean }[] = [
  { href: "/dashboard", label: "Home" },
  { href: "/mentors", label: "Mentors" },
  { href: "/messages", label: "Messages" },
  { href: "/sessions", label: "My sessions" },
];

/** Medical-school learners get their applicant tools between Mentors and Messages. */
const MED_SCHOOL_TABS = [
  { href: "/experience", label: "Experience log", plus: true },
  { href: "/portfolio", label: "Portfolio", plus: true },
  { href: "/gibbs", label: "Reflection", plus: true },
  { href: "/resources", label: "Resources", plus: true },
];

/** Home · Mentors · (applicant tools) · Messages · My sessions. Mentors don't get the Mentors tab. */
export function SpaceTabs({ isAdmin, isMentor, medSchool }: { isAdmin: boolean; isMentor: boolean; medSchool: boolean }) {
  const base = isMentor ? TABS.filter((t) => t.href !== "/mentors") : TABS;
  const tabs = medSchool ? [...base.slice(0, 2), ...MED_SCHOOL_TABS, ...base.slice(2)] : base;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="mb-8 flex flex-col-reverse gap-2 border-b border-lf-line md:flex-row md:items-end md:justify-between md:gap-4">
      <div className="-mb-px flex min-w-0 gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap border-b-[3px] px-4 pb-3 text-[17px] md:text-[19px] ${
                active ? "border-lf-ink font-medium text-lf-ink" : "border-transparent text-lf-muted hover:text-lf-ink"
              }`}
            >
              {t.label}
              {t.plus && (
                <span className="ml-2 rounded-md bg-[#DDF3E6] px-1.5 py-0.5 align-middle text-[11px] font-semibold tracking-wide text-[#1F7A4C]">
                  PLUS
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-none items-center justify-end gap-5 pb-1 text-[15px] text-lf-muted md:pb-3">
        {isAdmin && (
          <Link href="/admin" className="hover:text-lf-ink">
            Team console
          </Link>
        )}
        <button
          className="rounded-lg border border-lf-line bg-white px-4 py-1.5 font-medium text-lf-ink transition-colors hover:border-lf-ink hover:bg-lf-ink hover:text-white"
          onClick={async () => {
            await authClient.signOut();
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>
    </nav>
  );
}

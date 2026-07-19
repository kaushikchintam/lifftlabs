"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Video, MessageSquare, CalendarDays,
  Wallet, Receipt, Users,
} from "lucide-react";

const mentorItems = [
  { label: "Home", href: "/dashboard", icon: LayoutGrid },
  { label: "Sessions", href: "/sessions", icon: Video },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Earnings", href: "/earnings", icon: Wallet },
];

const learnerItems = [
  { label: "Home", href: "/dashboard", icon: LayoutGrid },
  { label: "Mentors", href: "/mentors", icon: Users },
  { label: "Sessions", href: "/sessions", icon: Video },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Payments", href: "/payments", icon: Receipt },
];

export function MobileNav({ role }: { role: "mentor" | "learner" }) {
  const pathname = usePathname();
  const items = role === "mentor" ? mentorItems : learnerItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#E8E2D6] bg-[#FBF7EE]">
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 font-dm-sans text-[10px] transition-colors ${
              active ? "text-[#18150F]" : "text-[#9A958A]"
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

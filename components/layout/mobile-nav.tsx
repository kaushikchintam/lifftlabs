"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Video, MessageSquare, CalendarDays,
  Wallet, Receipt, Users, CalendarClock, ListChecks, PiggyBank, ClipboardCheck, BookOpen, Feather, 
  type LucideIcon
} from "lucide-react";

import { CANONICAL_NAV, type Stages } from "./nav-items";
const ICONS: Record<string, LucideIcon> = {
  LayoutGrid, Video, MessageSquare, CalendarDays,
  Wallet, Receipt, Users, CalendarClock, ListChecks, PiggyBank, ClipboardCheck, BookOpen, Feather
}

//props = 'role' becomens 'stage', since mentor is now just one value
// among the four nav-items.ts filters against
type Props = {
  stage: Stages;
}

export function MobileNav({ stage }: Props) {
  const pathname = usePathname();

const navItems = CANONICAL_NAV.filter(
  (item) => item.stages.includes("*") || item.stages.includes(stage)
);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#E8E2D6] bg-[#FBF7EE]">
      {navItems.map(({ id, label, href, icon }) => {
        const Icon = icon ? ICONS[icon] : null;
        const active =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={id}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 font-dm-sans text-[10px] transition-colors ${
              active ? "text-[#18150F]" : "text-[#9A958A]"
            }`}
          >
            {Icon && <Icon size={20} strokeWidth={1.5} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

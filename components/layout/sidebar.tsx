"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useState } from "react";
import {
  LayoutGrid,
  Video,
  MessageSquare,
  CalendarDays,
  Wallet,
  Receipt,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Role-aware nav. `role` comes from the layout (mentor_profiles row check or
 * the role cookie — fine here: nav visibility is UX, every destination
 * re-derives authorization server-side per ADR 011).
 *
 * URLs follow the no-prefix convention: route group (dashboard) supplies the
 * layout, only the home page lives under /dashboard.
 */

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

type Props = {
  userName: string;
  initials: string;
  role: "mentor" | "learner";
};

export default function Sidebar({ userName, initials, role }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const navItems = role === "mentor" ? mentorItems : learnerItems;

  return (
    <aside
      className={`flex-shrink-0 flex flex-col bg-[#FBF7EE] border-r border-[#E8E2D6] h-full transition-all duration-200 ${collapsed ? "w-[60px]" : "w-[220px]"}`}
    >
      <div
        className={`flex items-center py-6 ${collapsed ? "justify-center px-0" : "justify-between px-5"}`}
      >
        {!collapsed && (
          <span className="font-archivo-black text-[#18150F] text-lg tracking-widest uppercase">
            LIFFT LABS
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#6F6B60] hover:text-[#18150F] transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm-sans transition-colors ${collapsed ? "justify-center" : ""} ${
                active
                  ? "bg-[#EDE8DC] text-[#18150F] font-medium"
                  : "text-[#6F6B60] hover:bg-[#EDE8DC] hover:text-[#18150F]"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 flex flex-col gap-0.5">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm-sans transition-colors ${collapsed ? "justify-center" : ""} ${
            pathname === "/settings"
              ? "bg-[#EDE8DC] text-[#18150F] font-medium"
              : "text-[#6F6B60] hover:bg-[#EDE8DC] hover:text-[#18150F]"
          }`}
        >
          <Settings size={16} strokeWidth={1.5} />
          {!collapsed && "Settings"}
        </Link>
        <button
          onClick={async () => {
            await authClient.signOut();
            router.push("/login");
          }}
          title={collapsed ? "Sign out" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm-sans transition-colors w-full ${collapsed ? "justify-center" : ""} text-[#6F6B60] hover:bg-[#EDE8DC] hover:text-[#18150F]`}
        >
          <LogOut size={16} strokeWidth={1.5} />
          {!collapsed && "Sign out"}
        </button>
        <div
          className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-7 h-7 rounded-full bg-[#18150F] flex items-center justify-center flex-shrink-0">
            <span className="font-dm-sans text-white text-xs font-medium">
              {initials}
            </span>
          </div>
          {!collapsed && (
            <span className="font-dm-sans text-sm text-[#18150F] truncate">
              {userName}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
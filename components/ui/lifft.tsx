import { cn } from "@/lib/utils";

/** Small shared pieces of the marketplace design language. */

const AVATAR_COLOURS = ["#8A5A2B", "#5B4A8E", "#7A3A57", "#35588A", "#8E8A7E", "#2F6F5A"];

export function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function Avatar({ name, id, size = 48 }: { name: string; id: string; size?: number }) {
  const hash = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  return (
    <div
      className="flex flex-none items-center justify-center rounded-xl font-medium text-white"
      style={{ width: size, height: size, background: AVATAR_COLOURS[hash % AVATAR_COLOURS.length], fontSize: size * 0.36 }}
    >
      {initialsOf(name)}
    </div>
  );
}

const PILL: Record<string, string> = {
  confirmed: "bg-[#E3EAFB] text-[#2F55B8]",
  approved: "bg-[#E3EAFB] text-[#2F55B8]",
  completed: "bg-[#DDF3E6] text-[#1F7A4C]",
  live: "bg-[#DDF3E6] text-[#1F7A4C]",
  shared: "bg-[#DDF3E6] text-[#1F7A4C]",
  waitlist: "bg-[#FBEFC2] text-[#755D1B]",
  pending: "bg-[#FBEFC2] text-[#755D1B]",
  paused: "bg-lf-soft text-lf-muted",
  hidden: "bg-lf-soft text-lf-muted",
  cancelled: "bg-lf-soft text-lf-muted",
  refunded: "bg-lf-soft text-lf-muted",
  expired: "bg-lf-soft text-lf-muted",
};

export function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-medium", PILL[tone] ?? PILL.paused)}>
      {children}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-lf-line bg-white p-7", className)}>{children}</div>;
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-lf-ink px-5 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#BDBDBD]";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-lf-line-strong bg-white px-4 py-2.5 text-[15px] font-medium text-lf-ink transition-colors hover:bg-lf-soft disabled:opacity-50";
export const inputCls =
  "w-full rounded-xl border border-lf-line-strong bg-white px-4 py-3 text-[15px] text-lf-ink outline-none placeholder:text-[#9A9A9A] focus:border-lf-ink";

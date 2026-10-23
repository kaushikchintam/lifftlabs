import Link from "next/link";
import { getServerSession } from "@/lib/auth/session";

/** Flat marketing nav: wordmark · centred links · Log in + Get started (or My space). */
export default async function Nav() {
  const session = await getServerSession();

  return (
    <header className="border-b border-lf-line bg-white">
      <div className="mx-auto grid max-w-[1680px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-[22px] md:grid-cols-[1fr_auto_1fr] md:px-[53px]">
        <Link href="/" className="justify-self-start text-[28px] font-bold tracking-[0.06em] text-lf-ink md:text-[37px]">
          LIFFTLABS
        </Link>
        <nav className="hidden gap-[53px] text-[20px] text-lf-ink md:flex">
          <Link href="/#journeys" className="hover:opacity-70">Explore support</Link>
          <Link href="/#how-it-works" className="hover:opacity-70">How it works</Link>
        </nav>
        <div className="flex items-center justify-self-end gap-[26px]">
          {!session && (
            <Link href="/login" className="text-[19px] font-medium text-lf-ink hover:opacity-70">
              Log in
            </Link>
          )}
          <Link
            href={session ? "/dashboard" : "/#journeys"}
            className="rounded-lg bg-[#0E1119] px-[26px] py-[15px] text-[19px] font-medium text-white hover:opacity-90"
          >
            {session ? "My space" : "Get started"}
          </Link>
        </div>
      </div>
    </header>
  );
}

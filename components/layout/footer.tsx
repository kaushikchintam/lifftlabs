import Link from "next/link";

/** Marketing footer — add to app/(marketing)/layout.tsx below {children}
 *  so it appears on the landing, about, privacy, and terms pages. */
export default function Footer() {
  return (
    <footer className="bg-[#18150F] text-white">
      <div className="mx-auto max-w-5xl px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div>
            <p className="font-archivo-black text-lg tracking-widest uppercase mb-3">
              LIFFT LABS
            </p>
            <p className="font-dm-sans text-sm text-white/60 max-w-xs leading-relaxed">
              Mentorship for people retraining into medicine and advancing
              within it.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="font-dm-sans text-xs uppercase tracking-wide text-white/40 mb-3">
                Platform
              </p>
              <ul className="font-dm-sans text-sm space-y-2">
                <li>
                  <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-dm-sans text-xs uppercase tracking-wide text-white/40 mb-3">
                Legal
              </p>
              <ul className="font-dm-sans text-sm space-y-2">
                <li>
                  <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white/80 hover:text-white transition-colors">
                    Terms of service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-dm-sans text-xs uppercase tracking-wide text-white/40 mb-3">
                Contact
              </p>
              <ul className="font-dm-sans text-sm space-y-2">
                <li>
                  <a
                    href="mailto:hello@lifftlabs.com"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    hello@lifftlabs.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="font-dm-sans text-xs text-white/40 mt-12">
          © {new Date().getFullYear()} LIFFT Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
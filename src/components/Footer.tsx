import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-purple text-chalk mt-16">
      <div className="max-w-4xl mx-auto px-5 py-6">
        <Link href="/" className="inline-block font-display font-black text-3xl sm:text-4xl mb-4 hover:opacity-90">
          Pass <span className="align-middle">⚽</span> Goal
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm mb-4">
          <Link href="/fixtures" className="hover:underline opacity-90 hover:opacity-100">
            Fixtures &amp; Results
          </Link>
          <Link href="/about" className="hover:underline opacity-90 hover:opacity-100">
            About
          </Link>
          <Link href="/contact" className="hover:underline opacity-90 hover:opacity-100">
            Contact us
          </Link>
          <Link href="/privacy" className="hover:underline opacity-90 hover:opacity-100">
            Privacy Policy &amp; Terms of Use
          </Link>
          <Link href="/disclosure" className="hover:underline opacity-90 hover:opacity-100">
            Affiliate Disclosure
          </Link>
        </nav>

        <p className="font-mono text-[10px] uppercase tracking-wider opacity-70 border-t border-white/15 pt-3">
          Pass Goal · Premier League coverage · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

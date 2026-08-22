"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/fixtures", label: "Fixtures & Results" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-purple text-chalk">
      <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-black text-lg tracking-wide transition-transform hover:-translate-y-[1px]"
        >
          Pass <span className="align-middle inline-block animate-pulse">⚽</span> Goal
        </Link>
        <nav className="flex gap-5 text-sm">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 transition-colors ${
                  active ? "opacity-100 font-bold" : "opacity-80 hover:opacity-100"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-[2px] w-full bg-gold rounded-full transition-transform duration-300 origin-left ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

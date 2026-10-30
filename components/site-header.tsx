"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full border-[3px] border-line bg-orange shadow-[3px_3px_0_var(--line)] transition-transform group-hover:rotate-180">
            <Swirl />
          </span>
          <span className="leading-none">
            <span className="display block text-2xl">NARUTO API</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">
              なると · unofficial
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`display rounded px-2.5 py-1 text-lg tracking-wider transition-colors sm:px-3 ${
                  active
                    ? "border-2 border-line bg-yellow text-[#15121a] shadow-[2px_2px_0_var(--line)]"
                    : "border-2 border-transparent hover:border-line"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Swirl({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 16c0-1.7 1.3-3 3-3s3 1.3 3 3c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-5 4-9 9-9s9 4 9 9c0 6.6-5.4 12-12 12S4 22.6 4 16"
        fill="none"
        stroke="#15121a"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

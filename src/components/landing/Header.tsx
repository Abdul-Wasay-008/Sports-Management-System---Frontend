"use client";

import Link from "next/link";
import { useState } from "react";

const nav = [
  { href: "#for-you", label: "Who it's for" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#organizers", label: "Organizers" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-brand-amber-500 to-amber-600 text-brand-950 shadow-lg shadow-amber-500/20"
            aria-hidden
          >
            <TrophyIcon className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-sm tracking-wide text-white sm:text-base">
              CUST Sports
            </span>
            <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
              Management System
            </span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex"
          aria-label="Main"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-brand-amber-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-3 py-2 text-sm font-semibold text-brand-950 shadow-md shadow-amber-500/25 transition hover:brightness-110 sm:px-4"
          >
            Get started
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-brand-900/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-slate-200" aria-label="Mobile">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-2 rounded-lg border border-white/20 py-2 text-center font-medium"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4Z"
        fill="currentColor"
      />
      <path
        d="M8 6H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M16 6h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 10v4M9 18h6M10 14h4M9.5 18v2h5V18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

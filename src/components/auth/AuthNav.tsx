import Link from "next/link";

type AuthNavProps = {
  /** Highlight current auth mode for link styling */
  mode: "login" | "register";
};

export function AuthNav({ mode }: AuthNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-brand-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-amber-500 to-amber-600 text-brand-950 shadow-md shadow-amber-500/20">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          </span>
          <span className="font-heading text-sm font-semibold tracking-wide text-white sm:text-base">
            CUST Sports
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/login"
            className={
              mode === "login"
                ? "rounded-lg bg-white/10 px-3 py-1.5 font-medium text-white"
                : "rounded-lg px-3 py-1.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            }
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={
              mode === "register"
                ? "rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-3 py-1.5 font-semibold text-brand-950 shadow-sm"
                : "rounded-lg px-3 py-1.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            }
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

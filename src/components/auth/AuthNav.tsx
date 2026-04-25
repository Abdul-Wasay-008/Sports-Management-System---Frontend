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
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 4h12v1a5 5 0 0 1-4 4.9V15h1a1 1 0 0 1 1 1v2H6v-2a1 1 0 0 1 1-1h1v-5.1A5 5 0 0 1 6 5V4Zm2 0v1a3 3 0 0 0 3 3V10h2V8a3 3 0 0 0 3-3V4H8Zm-2 6H4a1 1 0 0 0-1 1v1a3 3 0 0 0 2.2 2.9 4.9 4.9 0 0 1-.2-1.3V10Zm14 0h2a1 1 0 0 1 1 1v1a3 3 0 0 1-2.2 2.9c.14-.4.2-.8.2-1.3V10Z" />
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

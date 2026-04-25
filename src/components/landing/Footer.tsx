import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-heading text-sm font-semibold text-brand-900">CUST Sports Management System</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600" aria-label="Footer">
          <a href="#for-you" className="hover:text-brand-900">
            Overview
          </a>
          <a href="#how-it-works" className="hover:text-brand-900">
            Features
          </a>
          <a href="#organizers" className="hover:text-brand-900">
            Organizers
          </a>
          <Link href="/login" className="hover:text-brand-900">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}

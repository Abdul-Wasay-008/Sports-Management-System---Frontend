import Link from "next/link";

export function CTASection() {
  return (
    <section className="border-t border-slate-200/80 bg-brand-900 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Ready to join Sports Week?
        </h2>
        <p className="mt-3 text-slate-300">
          Create an account to register for events, or sign in if your department
          or role already has access.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-6 py-3.5 text-base font-semibold text-brand-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 px-6 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

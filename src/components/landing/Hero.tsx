import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <Image
        src="/images/Hero.jpg"
        alt="Aerial view of the CUST campus at sunset"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-900/70 to-brand-900/30"
        aria-hidden
      />
      <div className="absolute inset-0 bg-linear-to-r from-brand-950/90 via-brand-900/50 to-transparent sm:from-brand-950/80" aria-hidden />

      <div
        className="relative z-10 mx-auto w-full max-w-6xl min-h-svh px-4 sm:px-6 max-lg:grid max-lg:place-content-center max-lg:pb-16 max-lg:pt-20 sm:max-lg:pb-20 sm:max-lg:pt-24 lg:flex lg:flex-col lg:justify-center lg:pt-20 lg:pb-40"
      >
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand-amber-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-amber-400" />
            Manage Every Sport · CUST
          </p>
          <h1 className="font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Your home for
            <span className="mt-1 block bg-linear-to-r from-brand-amber-300 to-amber-500 bg-clip-text text-transparent">
              campus sports
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Register for events by gender, follow slots and team approvals, and keep
            departments aligned — built for students, team managers, game managers,
            and administrators.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-brand-amber-500 to-amber-600 px-6 py-3.5 text-center text-base font-semibold text-brand-950 shadow-lg shadow-amber-500/30 transition hover:brightness-110"
            >
              Create student account
            </Link>
            <Link
              href="#for-you"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-6 py-3.5 text-center text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Explore the platform
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            For Capital University of Science and Technology (CUST) — rules, venues,
            and results in one secure place.
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-slate-100 to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}

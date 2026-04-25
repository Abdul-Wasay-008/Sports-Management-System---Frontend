const audiences = [
  {
    title: "Students",
    description:
      "Sign up with your university details, browse games for your gender, and register for multiple events. When slots are limited, you will see real-time capacity — with team manager review where required.",
    icon: "student",
  },
  {
    title: "Department team managers",
    description:
      "Review enrollments for your department, accept or reject requests, and keep your roster aligned with Sports Week policy — the same role described in the official manual.",
    icon: "users",
  },
  {
    title: "Game managers",
    description:
      "Coordinate venues and the smooth running of your sport, working with the core committee and departments so matches stay on schedule.",
    icon: "field",
  },
  {
    title: "Administrators",
    description:
      "Create and update games, manage users, and see registrations across the board — including counts by gender and per-game participation for reporting and statistics.",
    icon: "admin",
  },
] as const;

export function AudienceSection() {
  return (
    <section
      id="for-you"
      className="relative border-t border-slate-200/80 bg-slate-100 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Built for every role
          </h2>
          <p className="mt-3 text-slate-600">
            One system for students, team managers, game managers, and admin oversight.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item) => (
            <article
              key={item.title}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-brand-amber-400 transition group-hover:bg-brand-800">
                <AudienceIcon name={item.icon} />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-900">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceIcon({ name }: { name: (typeof audiences)[number]["icon"] }) {
  const className = "h-6 w-6";
  switch (name) {
    case "student":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 1114 0" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a3 3 0 100 5.2 3 3 0 000-5.2zM3 19a6 6 0 1118 0" />
        </svg>
      );
    case "field":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" d="M4 8h16v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" />
          <path strokeLinecap="round" d="M4 12h16M8 8V6M16 8V6" />
        </svg>
      );
    case "admin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h4l1 3h6l1-3h4v3H4V5zM5 8h14v9a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
          <path strokeLinecap="round" d="M9 14h6" />
        </svg>
      );
    default:
      return null;
  }
}

const hierarchy = [
  {
    name: "Core Committee",
    detail: "Oversees platform-wide sports operations, schedule updates, and high-level policy decisions.",
  },
  {
    name: "Game managers",
    detail: "Run each sport: ensure smooth conduct, maintain match timing, and handle on-ground clarifications.",
  },
  {
    name: "Department sports managers & team managers",
    detail: "Coordinate with the committee and departments, manage rosters, and represent teams during matches.",
  },
];

export function OrganizerSection() {
  return (
    <section
      id="organizers"
      className="border-t border-slate-200/80 bg-linear-to-b from-slate-100 to-slate-50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            How sports are organized
          </h2>
          <p className="mt-3 text-slate-600">
            A clear chain from the core committee to game and department managers
            keeps operations structured. This platform supports that workflow
            online year-round.
          </p>
        </div>
        <ol className="mt-12 space-y-4">
          {hierarchy.map((item, i) => (
            <li
              key={item.name}
              className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:gap-6 sm:p-6"
            >
              <span className="font-heading flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-sm font-bold text-brand-amber-400">
                {i + 1}
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-brand-900">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm text-slate-500">
          Rules — including ID requirements, kits, rosters, and discipline — remain
          official policy; the system helps teams comply and stay coordinated.
        </p>
      </div>
    </section>
  );
}

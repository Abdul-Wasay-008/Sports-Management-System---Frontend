const hierarchy = [
  {
    name: "Core Committee",
    detail: "Oversees Sports Week, schedule changes, and high-level policy — the top tier in the official manual.",
  },
  {
    name: "Game managers",
    detail: "Appointed to run each sport: smooth conduct, timing with the published schedule, and final clarification on the ground.",
  },
  {
    name: "Department sports managers & team managers",
    detail: "Coordinate with the committee and your department, manage rosters, and represent teams during matches as described for CUST teams.",
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
            How Sports Week is organized
          </h2>
          <p className="mt-3 text-slate-600">
            The manual describes a clear chain from the core committee to game and
            department managers. This app is designed to support that structure
            online.
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
